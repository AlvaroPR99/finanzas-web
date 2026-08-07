import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration, ChartData } from 'chart.js';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { DashboardResponse, MesData, DiaData, InversionData } from '../../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const MESES_CORTOS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatoMes(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${MESES_CORTOS[m]}-${String(y).slice(2)}`;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BaseChartDirective, CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly data = inject(DataService);
  readonly dashboard = signal<DashboardResponse | null>(null);
  readonly loading = signal(true);
  editingSaldo = signal(false);
  saldoError = signal('');
  nuevoSaldo = 0;

  readonly patrimonio = computed(() => this.dashboard()?.patrimonio ?? 0);
  readonly resumen = computed(() => this.dashboard()?.mes);
  readonly comparativa = computed(() => this.dashboard()?.comparativa);
  readonly serieDiaria = computed(() => this.dashboard()?.serieDiaria ?? []);
  readonly evolucion12 = computed(() => this.dashboard()?.evolucion12 ?? []);
  readonly evolucionInversiones = computed(() => this.dashboard()?.evolucionInversiones ?? []);

  // Gráfica mensual: ingresos vs gastos por día
  chartMensualData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  chartMensualOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { title: { display: true, text: 'Día del mes' } },
      y: { title: { display: true, text: '€' }, beginAtZero: true },
    },
  };
  chartMensualType = 'bar' as const;

  // Evolución 12 meses
  chart12Data = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  chart12Options: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true, title: { display: true, text: '€' } } },
  };
  chart12Type = 'bar' as const;

  // Evolución inversiones
  chartInvData = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  chartInvOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { title: { display: true, text: '€' } } },
  };
  chartInvType = 'line' as const;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.data.dashboard().subscribe({
      next: (d) => {
        this.dashboard.set(d);
        this.nuevoSaldo = d.saldoInicial;
        this.construirGraficas(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private construirGraficas(d: DashboardResponse): void {
    const dias = d.serieDiaria.map((x: DiaData) => String(x.dia));
    this.chartMensualData.set({
      labels: dias,
      datasets: [
        { label: 'Ingresos', data: d.serieDiaria.map((x: DiaData) => x.ingresos), backgroundColor: '#000' },
        { label: 'Gastos', data: d.serieDiaria.map((x: DiaData) => x.gastos), backgroundColor: '#ccc' },
      ],
    });

    this.chart12Data.set({
      labels: d.evolucion12.map((x: MesData) => formatoMes(x.mes)),
      datasets: [
        { label: 'Ingresos', data: d.evolucion12.map((x: MesData) => x.ingresos), backgroundColor: '#000' },
        { label: 'Gastos', data: d.evolucion12.map((x: MesData) => x.gastos), backgroundColor: '#ccc' },
      ],
    });

    this.chartInvData.set({
      labels: d.evolucionInversiones.map((x: InversionData) => formatoMes(x.mes)),
      datasets: [
        { label: 'Invertido acumulado', data: d.evolucionInversiones.map((x: InversionData) => x.invertidoAcumulado), borderColor: '#000', backgroundColor: 'rgba(0,0,0,0.08)', fill: true, tension: 0.3 },
        { label: 'Valor actual', data: d.evolucionInversiones.map((x: InversionData) => x.valorActualAcumulado), borderColor: '#888', backgroundColor: 'rgba(0,0,0,0.04)', fill: true, tension: 0.3 },
      ],
    });
  }

  abrirEditarSaldo(): void {
    this.nuevoSaldo = this.dashboard()?.saldoInicial ?? 0;
    this.saldoError.set('');
    this.editingSaldo.set(true);
  }

  guardarSaldo(): void {
    if (this.nuevoSaldo == null || isNaN(this.nuevoSaldo) || this.nuevoSaldo < 0) {
      this.saldoError.set('El saldo debe ser un número positivo');
      return;
    }
    this.auth.updateSaldoInicial(this.nuevoSaldo).subscribe({
      next: () => {
        this.editingSaldo.set(false);
        this.cargar();
      },
      error: (e: any) => {
        this.saldoError.set(e.error?.error ?? 'Error al guardar el saldo');
      },
    });
  }
}
