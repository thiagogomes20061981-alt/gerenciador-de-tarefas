import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AsyncPipe],
  template: `
    <header class="bg-indigo-600 text-white shadow">
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
        <a routerLink="/" class="text-lg font-semibold">✅ Tarefas</a>
        <nav class="flex items-center gap-3 text-sm">
          @if (auth.loggedIn$ | async) {
            <span class="hidden sm:inline opacity-80">Olá, {{ auth.username }}</span>
            <button type="button" class="rounded-lg bg-white/15 px-3 py-1.5 hover:bg-white/25" (click)="logout()">Sair</button>
          } @else {
            <a routerLink="/login" class="hover:underline">Entrar</a>
            <a routerLink="/register" class="hover:underline">Criar conta</a>
          }
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-3xl px-4 py-6">
      <router-outlet />
    </main>
  `,
})
export class App {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
