import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Categoria, Recurrente, RecurrenteRequest } from '../../models/models';

@Component({
  selector: 'app-recurrentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recurrentes.html',
  styleUrl: './recurrentes.css',
})
export class RecurrentesComponent implements OnInit {
  private data = inject(DataService);

  recurrentes = signal<Recurrente[]>([]);
  categorias = signal<Categoria[]>([]);
  categoriasTipo = signal<Categoria[]>([]);
  loading = signal(true);
  error = signal('');
  saving = signal(false);

  formOpen = signal(false);
  editId = signal<number | null>(null);
  form = {
    tipo: 'GASTO',
    tipoGasto: 'FIJO',
    monto: null as number | null,
    descripcion: '',
    categoriaId: null as number | null,
    diaDelMes: 1,
    activo: true,
  };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.data.categorias().subscribe({
      next: (cats) => {
        this.categorias.set(cats);
        this.refrescar();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar las categorías');
      },
    });
  }

  private refrescar(): void {
    this.data.listarRecurrentes().subscribe({
      next: (list) => {
        this.recurrentes.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los recurrentes');
      },
    });
  }

  actualizarCategoriasPorTipo(): void {
    this.categoriasTipo.set(this.categorias().filter(c => c.tipo === this.form.tipo));
    if (this.form.categoriaId && !this.categoriasTipo().find(c => c.id === this.form.categoriaId)) {
      this.form.categoriaId = this.categoriasTipo()[0]?.id ?? null;
    } else if (!this.form.categoriaId) {
      this.form.categoriaId = this.categoriasTipo()[0]?.id ?? null;
    }
  }

  abrirNuevo(): void {
    this.editId.set(null);
    this.error.set('');
    this.form = {
      tipo: 'GASTO',
      tipoGasto: 'FIJO',
      monto: null,
      descripcion: '',
      categoriaId: null,
      diaDelMes: 1,
      activo: true,
    };
    this.actualizarCategoriasPorTipo();
    this.formOpen.set(true);
  }

  abrirEditar(r: Recurrente): void {
    this.editId.set(r.id);
    this.error.set('');
    this.form = {
      tipo: r.tipo,
      tipoGasto: r.tipoGasto ?? 'FIJO',
      monto: r.monto,
      descripcion: r.descripcion,
      categoriaId: r.categoria?.id ?? null,
      diaDelMes: r.diaDelMes,
      activo: r.activo,
    };
    this.actualizarCategoriasPorTipo();
    this.formOpen.set(true);
  }

  cerrarForm(): void {
    this.formOpen.set(false);
    this.editId.set(null);
    this.error.set('');
  }

  guardar(): void {
    if (this.form.monto == null || this.form.monto <= 0) {
      this.error.set('El importe debe ser positivo');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const payload: RecurrenteRequest = {
      tipo: this.form.tipo as 'INGRESO' | 'GASTO',
      tipoGasto: this.form.tipo === 'GASTO' ? this.form.tipoGasto as 'FIJO' | 'VARIABLE' : null,
      monto: this.form.monto,
      descripcion: this.form.descripcion,
      categoriaId: this.form.categoriaId,
      diaDelMes: this.form.diaDelMes,
      activo: this.form.activo,
    };
    const id = this.editId();
    const obs = id
      ? this.data.actualizarRecurrente(id, payload)
      : this.data.crearRecurrente(payload);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.cerrarForm();
        this.refrescar();
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(e.error?.error ?? 'Error al guardar');
      },
    });
  }

  eliminar(r: Recurrente): void {
    if (!confirm(`¿Eliminar el recurrente "${r.descripcion || 'sin descripción'}"?`)) return;
    this.data.eliminarRecurrente(r.id).subscribe({
      next: () => this.refrescar(),
      error: (e) => this.error.set(e.error?.error ?? 'Error al eliminar'),
    });
  }
}
