import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, UserDTO } from '../models/models';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'finanzas_token';
const USER_KEY = 'finanzas_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;
  readonly user = signal<UserDTO | null>(null);

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        this.user.set(JSON.parse(saved));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  register(username: string, password: string, saldoInicial: number): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, { username, password, saldoInicial })
      .pipe(tap(r => this.save(r)));
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, { username, password })
      .pipe(tap(r => this.save(r)));
  }

  updateSaldoInicial(saldoInicial: number): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.api}/saldo-inicial`, { saldoInicial })
      .pipe(tap(u => {
        this.user.set(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      }));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
  }

  private save(r: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, r.token);
    localStorage.setItem(USER_KEY, JSON.stringify(r.user));
    this.user.set(r.user);
  }
}
