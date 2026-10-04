import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, map, switchMap, takeUntil, tap } from 'rxjs';
import { TasksService } from '../../core/services/tasks.service';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1 class="mb-4 text-2xl font-bold">{{ id ? 'Editar tarefa' : 'Nova tarefa' }}</h1>

    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-6">
      <div>
        <label for="title" class="mb-1 block text-sm font-medium">Título *</label>
        <input id="title" type="text" class="input" formControlName="title" maxlength="150" />
        @if (form.controls.title.touched && form.controls.title.invalid) {
          <p class="mt-1 text-xs text-red-600">Informe um título (até 150 caracteres).</p>
        }
      </div>

      <div>
        <label for="description" class="mb-1 block text-sm font-medium">Descrição</label>
        <textarea id="description" rows="4" class="input" formControlName="description" maxlength="2000"></textarea>
      </div>

      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" class="h-4 w-4 accent-indigo-600" formControlName="done" />
        Concluída
      </label>

      @if (error) {
        <p class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
      }

      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <a routerLink="/" class="btn-ghost">Cancelar</a>
        <button type="submit" class="btn-primary" [disabled]="form.invalid || saving">
          {{ saving ? 'Salvando…' : 'Salvar' }}
        </button>
      </div>
    </form>
  `,
})
export class TaskFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(TasksService);
  private readonly destroy$ = new Subject<void>();

  id: number | null = null;
  saving = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', Validators.maxLength(2000)],
    done: [false],
  });

  ngOnInit(): void {
    // Modo edição: carrega a tarefa a partir do parâmetro :id da rota.
    this.route.paramMap
      .pipe(
        map((p) => p.get('id')),
        tap((id) => (this.id = id ? Number(id) : null)),
        switchMap((id) =>
          id
            ? this.service.getById(Number(id)).pipe(
                catchError(() => {
                  this.router.navigate(['/']);
                  return EMPTY;
                }),
              )
            : EMPTY,
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((task) =>
        this.form.patchValue({
          title: task.title,
          description: task.description ?? '',
          done: task.done,
        }),
      );
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    const value = this.form.getRawValue();
    const request$ = this.id ? this.service.update(this.id, value) : this.service.create(value);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.saving = false;
        this.error = 'Não foi possível salvar a tarefa.';
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
