import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-item',
  imports: [DatePipe, RouterLink],
  template: `
    <li class="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-start gap-3">
        <input
          type="checkbox"
          class="mt-1 h-5 w-5 accent-indigo-600"
          [checked]="task().done"
          (change)="toggleDone.emit(task())"
          [attr.aria-label]="'Concluir ' + task().title"
        />
        <div>
          <p class="font-medium" [class.line-through]="task().done" [class.text-slate-400]="task().done">
            {{ task().title }}
          </p>
          @if (task().description) {
            <p class="mt-0.5 text-sm text-slate-500">{{ task().description }}</p>
          }
          <p class="mt-1 text-xs text-slate-400">Criada em {{ task().created_at | date: 'dd/MM/yyyy HH:mm' }}</p>
        </div>
      </div>
      <div class="flex gap-2 sm:shrink-0">
        <a class="btn-ghost flex-1 sm:flex-none" [routerLink]="['/tasks', task().id, 'edit']">Editar</a>
        <button type="button" class="btn-danger flex-1 sm:flex-none" (click)="remove.emit(task())">Excluir</button>
      </div>
    </li>
  `,
})
export class TaskItemComponent {
  readonly task = input.required<Task>();
  readonly toggleDone = output<Task>();
  readonly remove = output<Task>();
}
