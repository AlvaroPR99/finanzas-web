import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { LayoutComponent } from './pages/layout/layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { MovimientosComponent } from './pages/movimientos/movimientos';
import { RecurrentesComponent } from './pages/recurrentes/recurrentes';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'ingresos', component: MovimientosComponent, data: { tipo: 'INGRESO' } },
      { path: 'gastos', component: MovimientosComponent, data: { tipo: 'GASTO' } },
      { path: 'ahorros', component: MovimientosComponent, data: { tipo: 'AHORRO' } },
      { path: 'inversiones', component: MovimientosComponent, data: { tipo: 'INVERSION' } },
      { path: 'recurrentes', component: RecurrentesComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
