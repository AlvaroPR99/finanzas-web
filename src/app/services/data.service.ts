import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Ahorro, Categoria, DashboardResponse, Gasto, Ingreso, Inversion,
  InversionRequest, MovementRequest, Recurrente, RecurrenteRequest,
} from '../models/models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {}

  categorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${API}/categorias`);
  }

  dashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${API}/dashboard`);
  }

  listarIngresos(): Observable<Ingreso[]> {
    return this.http.get<Ingreso[]>(`${API}/ingresos`);
  }
  crearIngreso(r: MovementRequest): Observable<Ingreso> {
    return this.http.post<Ingreso>(`${API}/ingresos`, r);
  }
  actualizarIngreso(id: number, r: MovementRequest): Observable<Ingreso> {
    return this.http.put<Ingreso>(`${API}/ingresos/${id}`, r);
  }
  eliminarIngreso(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/ingresos/${id}`);
  }

  listarGastos(): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(`${API}/gastos`);
  }
  crearGasto(r: MovementRequest): Observable<Gasto> {
    return this.http.post<Gasto>(`${API}/gastos`, r);
  }
  actualizarGasto(id: number, r: MovementRequest): Observable<Gasto> {
    return this.http.put<Gasto>(`${API}/gastos/${id}`, r);
  }
  eliminarGasto(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/gastos/${id}`);
  }

  listarAhorros(): Observable<Ahorro[]> {
    return this.http.get<Ahorro[]>(`${API}/ahorros`);
  }
  crearAhorro(r: MovementRequest): Observable<Ahorro> {
    return this.http.post<Ahorro>(`${API}/ahorros`, r);
  }
  actualizarAhorro(id: number, r: MovementRequest): Observable<Ahorro> {
    return this.http.put<Ahorro>(`${API}/ahorros/${id}`, r);
  }
  eliminarAhorro(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/ahorros/${id}`);
  }

  listarInversiones(): Observable<Inversion[]> {
    return this.http.get<Inversion[]>(`${API}/inversiones`);
  }
  crearInversion(r: InversionRequest): Observable<Inversion> {
    return this.http.post<Inversion>(`${API}/inversiones`, r);
  }
  actualizarInversion(id: number, r: InversionRequest): Observable<Inversion> {
    return this.http.put<Inversion>(`${API}/inversiones/${id}`, r);
  }
  eliminarInversion(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/inversiones/${id}`);
  }

  listarRecurrentes(): Observable<Recurrente[]> {
    return this.http.get<Recurrente[]>(`${API}/recurrentes`);
  }
  crearRecurrente(r: RecurrenteRequest): Observable<Recurrente> {
    return this.http.post<Recurrente>(`${API}/recurrentes`, r);
  }
  actualizarRecurrente(id: number, r: RecurrenteRequest): Observable<Recurrente> {
    return this.http.put<Recurrente>(`${API}/recurrentes/${id}`, r);
  }
  eliminarRecurrente(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/recurrentes/${id}`);
  }
}
