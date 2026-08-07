import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Categoria, Ingreso, Gasto, Ahorro, Inversion } from '../../models/models';

interface Config {
  tipo: string;
  title: string;
  montoLabel: string;
  montoField: 'monto' | 'montoInvertido';
  hasTipoGasto: boolean;
  hasPorcentaje: boolean;
  agruparPorMes: boolean;
  endpoint: string;
  subtitle: string;
}

const CONFIGS: Record<string, Config> = {
  INGRESO: { tipo: 'INGRESO', title: 'Ingresos', montoLabel: 'Importe', montoField: 'monto', hasTipoGasto: false, hasPorcentaje: false, agruparPorMes: true, endpoint: 'ingresos', subtitle: 'Dinero que entra' },
  GASTO: { tipo: 'GASTO', title: 'Gastos', montoLabel: 'Importe', montoField: 'monto', hasTipoGasto: true, hasPorcentaje: false, agruparPorMes: true, endpoint: 'gastos', subtitle: 'Dinero que sale' },
  AHORRO: { tipo: 'AHORRO', title: 'Ahorros', montoLabel: 'Importe', montoField: 'monto', hasTipoGasto: false, hasPorcentaje: false, agruparPorMes: true, endpoint: 'ahorros', subtitle: 'Dinero apartado' },
  INVERSION: { tipo: 'INVERSION', title: 'Inversiones', montoLabel: 'Monto invertido', montoField: 'montoInvertido', hasTipoGasto: false, hasPorcentaje: true, agruparPorMes: false, endpoint: 'inversiones', subtitle: 'Dinero invertido y su rentabilidad' },
};

interface Row {
  id: number;
  fecha: string;
  descripcion: string;
  categoria: Categoria | null;
  monto: number;
  tipoGasto?: string;
  porcentaje?: number;
  valorActual?: number;
}

const MESES_NOMBRE = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface MesGrupo {
  clave: string;
  etiqueta: string;
  esActual: boolean;
  registros: Row[];
  total: number;
}

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css',
})
export class MovimientosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private data = inject(DataService);

  config!: Config;
  categorias = signal<Categoria[]>([]);
  rows = signal<Row[]>([]);
  grupos = signal<MesGrupo[]>([]);
  total = signal(0);
  totalActual = signal(0);
  loading = signal(true);
  error = signal('');
  saving = signal(false);

  formOpen = signal(false);
  editId = signal<number | null>(null);
  form = {
    monto: null as number | null,
    descripcion: '',
    categoriaId: null as number | null,
    tipoGasto: 'VARIABLE',
    porcentaje: 0,
    fecha: new Date().toISOString().slice(0, 10),
  };

  ngOnInit(): void {
    const tipo = this.route.snapshot.data['tipo'] as string;
    this.config = CONFIGS[tipo];
    if (!this.config) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.data.categorias().subscribe({
      next: (cats: Categoria[]) => {
        this.categorias.set(cats.filter(c => c.tipo === this.config.tipo));
        this.refrescarMovimientos();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar las categorías');
      },
    });
  }

  private refrescarMovimientos(): void {
    (this.data as any)[this.listMethod()]().subscribe({
      next: (list: any[]) => {
        const rows = list.map(i => this.toRow(i));
        this.rows.set(rows);
        this.grupos.set(this.config.agruparPorMes ? this.agruparPorMes(rows) : this.agruparInversiones(rows));
        this.total.set(rows.reduce((acc, r) => acc + (r.monto > 0 ? r.monto : 0), 0));
        this.totalActual.set(rows.reduce((acc, r) => acc + (r.valorActual ?? 0), 0));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los datos');
      },
    });
  }

  private agruparInversiones(rows: Row[]): MesGrupo[] {
    const ordenadas = [...rows].sort((a, b) => b.fecha.localeCompare(a.fecha));
    return [{
      clave: 'inversiones',
      etiqueta: 'Todas las inversiones',
      esActual: false,
      registros: ordenadas,
      total: ordenadas.reduce((acc, r) => acc + (r.monto > 0 ? r.monto : 0), 0),
    }];
  }

  private etiquetaMes(clave: string): string {
    const [y, m] = clave.split('-').map(Number);
    return `${MESES_NOMBRE[m] ?? ''} ${y}`.trim();
  }

  private agruparPorMes(rows: Row[]): MesGrupo[] {
    const mesActual = new Date().toISOString().slice(0, 7);
    const porMes = new Map<string, Row[]>();
    for (const r of rows) {
      const clave = r.fecha.slice(0, 7);
      const arr = porMes.get(clave) ?? [];
      arr.push(r);
      porMes.set(clave, arr);
    }
    return [...porMes.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([clave, regs]) => ({
        clave,
        etiqueta: this.etiquetaMes(clave),
        esActual: clave === mesActual,
        registros: regs,
        total: regs.reduce((acc, r) => acc + (r.monto > 0 ? r.monto : 0), 0),
      }));
  }

  private listMethod(): 'listarIngresos' | 'listarGastos' | 'listarAhorros' | 'listarInversiones' {
    switch (this.config.endpoint) {
      case 'ingresos': return 'listarIngresos';
      case 'gastos': return 'listarGastos';
      case 'ahorros': return 'listarAhorros';
      default: return 'listarInversiones';
    }
  }

  private toRow(item: Ingreso | Gasto | Ahorro | Inversion): Row {
    const monto = this.config.montoField === 'monto'
      ? (item as Ingreso).monto
      : (item as Inversion).montoInvertido;
    return {
      id: item.id,
      fecha: item.fecha,
      descripcion: item.descripcion,
      categoria: item.categoria,
      monto,
      tipoGasto: (item as Gasto).tipoGasto,
      porcentaje: (item as Inversion).porcentaje,
      valorActual: (item as Inversion).valorActual,
    };
  }

  abrirNuevo(): void {
    this.editId.set(null);
    this.error.set('');
    this.form = {
      monto: null,
      descripcion: '',
      categoriaId: this.categorias()[0]?.id ?? null,
      tipoGasto: 'VARIABLE',
      porcentaje: 0,
      fecha: new Date().toISOString().slice(0, 10),
    };
    this.formOpen.set(true);
  }

  abrirEditar(row: Row): void {
    this.editId.set(row.id);
    this.error.set('');
    this.form = {
      monto: row.monto,
      descripcion: row.descripcion,
      categoriaId: row.categoria?.id ?? null,
      tipoGasto: row.tipoGasto ?? 'VARIABLE',
      porcentaje: row.porcentaje ?? 0,
      fecha: row.fecha,
    };
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
    const payload: any = {
      monto: this.form.monto,
      descripcion: this.form.descripcion,
      categoriaId: this.form.categoriaId,
      fecha: this.form.fecha,
    };
    if (this.config.hasTipoGasto) {
      payload.tipoGasto = this.form.tipoGasto;
    }
    if (this.config.hasPorcentaje) {
      payload.montoInvertido = this.form.monto;
      payload.porcentaje = this.form.porcentaje;
      delete payload.monto;
    }
    const id = this.editId();
    const fn = id
      ? (this.data as any)[this.updateMethod(id)](id, payload)
      : (this.data as any)[this.createMethod()](payload);
    fn.subscribe({
      next: () => {
        this.saving.set(false);
        this.cerrarForm();
        this.refrescarMovimientos();
      },
      error: (e: any) => {
        this.saving.set(false);
        this.error.set(e.error?.error ?? 'Error al guardar');
      },
    });
  }

  private createMethod(): 'crearIngreso' | 'crearGasto' | 'crearAhorro' | 'crearInversion' {
    switch (this.config.endpoint) {
      case 'ingresos': return 'crearIngreso';
      case 'gastos': return 'crearGasto';
      case 'ahorros': return 'crearAhorro';
      default: return 'crearInversion';
    }
  }

  private updateMethod(id: number) {
    const fn = this.createMethod().replace('crear', 'actualizar');
    return fn as any;
  }

  eliminar(row: Row): void {
    if (!confirm(`¿Eliminar "${row.descripcion || 'sin descripción'}" (${row.monto} €)?`)) return;
    (this.data as any)[this.deleteMethod()](row.id).subscribe({
      next: () => this.refrescarMovimientos(),
      error: (e: any) => this.error.set(e.error?.error ?? 'Error al eliminar'),
    });
  }

  private deleteMethod(): 'eliminarIngreso' | 'eliminarGasto' | 'eliminarAhorro' | 'eliminarInversion' {
    switch (this.config.endpoint) {
      case 'ingresos': return 'eliminarIngreso';
      case 'gastos': return 'eliminarGasto';
      case 'ahorros': return 'eliminarAhorro';
      default: return 'eliminarInversion';
    }
  }
}
