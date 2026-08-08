export interface Categoria {
  id: number;
  nombre: string;
  icono: string;
  color: string;
  tipo: 'INGRESO' | 'GASTO' | 'AHORRO' | 'INVERSION';
}

export interface UserDTO {
  id: number;
  username: string;
  saldoInicial: number;
}

export interface AuthResponse {
  token: string;
  user: UserDTO;
}

export interface Ingreso {
  id: number;
  monto: number;
  descripcion: string;
  categoria: Categoria | null;
  fecha: string;
}

export interface Gasto {
  id: number;
  monto: number;
  descripcion: string;
  categoria: Categoria | null;
  tipoGasto: 'FIJO' | 'VARIABLE';
  fecha: string;
}

export interface Ahorro {
  id: number;
  monto: number;
  descripcion: string;
  categoria: Categoria | null;
  fecha: string;
}

export interface Inversion {
  id: number;
  montoInvertido: number;
  porcentaje: number;
  descripcion: string;
  categoria: Categoria | null;
  fecha: string | null;
  esInicial: boolean;
  padreId: number | null;
  valorActual: number;
}

export interface Recurrente {
  id: number;
  tipo: 'INGRESO' | 'GASTO';
  tipoGasto: 'FIJO' | 'VARIABLE' | null;
  monto: number;
  descripcion: string;
  categoria: Categoria | null;
  diaDelMes: number;
  activo: boolean;
}

export interface MovementRequest {
  monto: number;
  descripcion: string;
  categoriaId: number | null;
  tipoGasto?: 'FIJO' | 'VARIABLE' | null;
  fecha: string;
}

export interface InversionRequest {
  montoInvertido: number;
  porcentaje: number;
  descripcion: string;
  categoriaId: number | null;
  fecha: string | null;
  esInicial: boolean;
  padreId: number | null;
}

export interface RecurrenteRequest {
  tipo: 'INGRESO' | 'GASTO';
  tipoGasto: 'FIJO' | 'VARIABLE' | null;
  monto: number;
  descripcion: string;
  categoriaId: number | null;
  diaDelMes: number;
  activo: boolean;
}

export interface ResumenMes {
  ingresos: number;
  gastos: number;
  ahorros: number;
  inversiones: number;
  balance: number;
  tasaAhorro: number;
}

export interface Comparativa {
  gastosDeltaPct: number | null;
  ingresosDeltaPct: number | null;
}

export interface DiaData {
  dia: number;
  ingresos: number;
  gastos: number;
  balance: number;
}

export interface MesData {
  mes: string;
  ingresos: number;
  gastos: number;
  balance: number;
}

export interface InversionData {
  mes: string;
  invertidoAcumulado: number;
  valorActualAcumulado: number;
}

export interface DashboardResponse {
  patrimonio: number;
  disponible: number;
  saldoInicial: number;
  mes: ResumenMes;
  comparativa: Comparativa;
  serieDiaria: DiaData[];
  evolucion12: MesData[];
  evolucionInversiones: InversionData[];
}
