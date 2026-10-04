import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_URL } from '../config';
import { Task, TaskPayload } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/tasks`;

  /** Estado reativo da lista; atualizado a cada operação bem-sucedida. */
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  loadAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.url).pipe(tap((tasks) => this.tasksSubject.next(tasks)));
  }

  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.url}/${id}`);
  }

  create(payload: TaskPayload): Observable<Task> {
    return this.http
      .post<Task>(this.url, payload)
      .pipe(tap((created) => this.tasksSubject.next([...this.tasksSubject.value, created])));
  }

  update(id: number, payload: TaskPayload): Observable<Task> {
    return this.http.put<Task>(`${this.url}/${id}`, payload).pipe(
      tap((updated) =>
        this.tasksSubject.next(this.tasksSubject.value.map((t) => (t.id === id ? updated : t))),
      ),
    );
  }

  remove(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${id}`)
      .pipe(tap(() => this.tasksSubject.next(this.tasksSubject.value.filter((t) => t.id !== id))));
  }
}
