import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-sm">
      <h1 class="mb-4 text-2xl font-bold">{{ isRegister ? 'Criar conta' : 'Entrar' }}</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <div>
          <label for="username" class="mb-1 block text-sm font-medium">Usuário</label>
          <input id="username" class="input" formControlName="username" autocomplete="username" />
        </div>
        <div>
          <label for="password" class="mb-1 block text-sm font-medium">Senha</label>
          <input id="password" type="password" class="input" formControlName="password"
                 [autocomplete]="isRegister ? 'new-password' : 'current-password'" />
          @if (isRegister) {
            <p class="mt-1 text-xs text-slate-500">Mínimo de 6 caracteres.</p>
          }
        </div>
        @if (error) {
          <p class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
        }
        <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || loading">
          {{ loading ? 'Aguarde…' : isRegister ? 'Cadastrar' : 'Entrar' }}
        </button>
        <p class="text-center text-sm text-slate-500">
          @if (isRegister) {
            Já tem conta? <a routerLink="/login" class="text-indigo-600 hover:underline">Entrar</a>
          } @else {
            Novo por aqui? <a routerLink="/register" class="text-indigo-600 hover:underline">Criar conta</a>
          }
        </p>
      </form>
    </div>
  `,
})
export class AuthComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly isRegister = inject(ActivatedRoute).snapshot.data['mode'] === 'register';
  loading = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { username, password } = this.form.getRawValue();
    const request$ = this.isRegister
      ? this.auth.register(username, password)
      : this.auth.login(username, password);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error =
          err.status === 409 ? 'Esse usuário já existe.'
          : err.status === 401 ? 'Usuário ou senha inválidos.'
          : 'Não foi possível concluir. Tente novamente.';
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
