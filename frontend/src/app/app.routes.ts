import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { TasksListComponent } from './pages/tasks-list/tasks-list.component';
import { TaskFormComponent } from './pages/task-form/task-form.component';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [
  { path: '', component: TasksListComponent, canActivate: [authGuard], title: 'Tarefas' },
  { path: 'tasks/new', component: TaskFormComponent, canActivate: [authGuard], title: 'Nova tarefa' },
  { path: 'tasks/:id/edit', component: TaskFormComponent, canActivate: [authGuard], title: 'Editar tarefa' },
  { path: 'login', component: AuthComponent, data: { mode: 'login' }, title: 'Entrar' },
  { path: 'register', component: AuthComponent, data: { mode: 'register' }, title: 'Criar conta' },
  { path: '**', redirectTo: '' },
];
