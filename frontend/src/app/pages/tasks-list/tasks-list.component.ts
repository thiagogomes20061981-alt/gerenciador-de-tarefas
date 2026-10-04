import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, Subject, catchError, combineLatest, map, of, switchMap, takeUntil } from 'rxjs';
import { Task } from '../../core/models/task.model';
import { TasksService } from '../../core/services/tasks.service';
import { TaskItemComponent } from '../../shared/components/task-item/task-item.component';

type Filter = 'all' | 'pending' | 'done';

@Component({
  selector: 'app-tasks-list',
  imports: [AsyncPipe, RouterLink, TaskItemComponent],
  template: `
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold">Minhas tarefas</h1>
      <a routerLink="/tasks/new" class="btn-primary">+ Nova tarefa</a>
    </div>

    <div class="mb-4 flex gap-2">
      @for (f of filters; track f.value) {
        <button
          type="button"
          class="rounded-full px-3 py-1 text-sm"
          [class]="(filter$ | async) === f.value ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'"
          (click)="filter$.next(f.value)"
        >
          {{ f.label }}
        </button>
      }
    </div>

    @if (error) {
      <p class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
    }

    @if (tasks$ | async; as tasks) {
      @if (tasks.length === 0 && !error) {
        <p class="rounded-xl bg-white p-8 text-center text-slate-500">Nenhuma tarefa por aqui. 🎉</p>
      }
      <ul class="space-y-3">
        @for (task of tasks; track task.id) {
          <app-task-item [task]="task" (toggleDone)="toggle($event)" (remove)="remove($event)" />
        }
      </ul>
    } @else {
      <p class="text-center text-slate-500">Carregando…</p>
    }
  `,
})
export class TasksListComponent implements OnDestroy {
  private readonly service = inject(TasksService);
  private readonly destroy$ = new Subject<void>();

  readonly filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'done', label: 'Concluídas' },
  ];
  readonly filter$ = new BehaviorSubject<Filter>('all');
  error = '';

  /** Carrega da API e, depois, passa a refletir o BehaviorSubject do service + filtro. */
  readonly tasks$ = this.service.loadAll().pipe(
    switchMap(() => combineLatest([this.service.tasks$, this.filter$])),
    map(([tasks, filter]) =>
      tasks.filter((t) => (filter === 'all' ? true : filter === 'done' ? t.done : !t.done)),
    ),
    catchError(() => {
      this.error = 'Não foi possível carregar as tarefas. A API está rodando?';
      return of([] as Task[]);
    }),
  );

  toggle(task: Task): void {
    this.service
      .update(task.id, { title: task.title, description: task.description, done: !task.done })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ error: () => (this.error = 'Falha ao atualizar a tarefa.') });
  }

  remove(task: Task): void {
    if (!confirm(`Excluir "${task.title}"?`)) return;
    this.service
      .remove(task.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ error: () => (this.error = 'Falha ao excluir a tarefa.') });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
