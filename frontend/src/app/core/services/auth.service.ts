import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { API_URL } from '../config';

interface AuthResponse {
  token: string;
  username: string;
}

const TOKEN_KEY = 'tasks.token';
const USER_KEY = 'tasks.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly loggedIn$: Observable<boolean> = this.tokenSubject.pipe(map((t) => !!t));

  get token(): string | null {
    return this.tokenSubject.value;
  }

  get username(): string {
    return localStorage.getItem(USER_KEY) ?? '';
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, { username, password })
      .pipe(tap((r) => this.save(r)));
  }

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/register`, { username, password })
      .pipe(tap((r) => this.save(r)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSubject.next(null);
  }

  private save(r: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, r.token);
    localStorage.setItem(USER_KEY, r.username);
    this.tokenSubject.next(r.token);
  }
}
