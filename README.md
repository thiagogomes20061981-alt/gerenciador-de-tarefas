# Gerenciador de Tarefas — Spring Boot + Angular

Aplicação full-stack (API REST + SPA) para criar, listar, editar e excluir tarefas, com autenticação JWT.

## Versões utilizadas
| Item | Versão |
|---|---|
| Java | 21 |
| Spring Boot | 3.4.5 (Web, Data JPA/Hibernate, Validation, Security) |
| Gradle | 8.10+ |
| Banco | H2 em memória (padrão) / PostgreSQL 16 (Docker) |
| Migrações | Flyway |
| Angular | 20.x (componentes standalone) |
| Node | 22 |
| TailwindCSS | 3.4 |

## Estrutura
```
backend/   API Spring Boot (config, task, auth, dto)
frontend/  SPA Angular (core, pages, shared)
docker-compose.yml, .github/workflows/ci.yml
```

## Rodando localmente

### Backend
```bash
cd backend
gradle wrapper --gradle-version 8.10.2   # só na primeira vez, gera o ./gradlew
./gradlew bootRun                        # http://localhost:8080
./gradlew test
```
No PowerShell use `.\gradlew.bat`. Sem configuração, usa H2 em memória (já com 3 tarefas de seed via Flyway `V3__seed_tasks.sql`).
Variáveis opcionais: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGINS`.

### Frontend
```bash
cd frontend
npm install
npm start                                # http://localhost:4200
npm run lint                             # ESLint (angular-eslint)
```
A URL da API fica em `frontend/src/app/core/config.ts`.

### Docker (API + Postgres + SPA)
```bash
docker compose up --build
```
SPA em http://localhost:4200 e API em http://localhost:8080.

## API
Todas as rotas `/tasks` exigem `Authorization: Bearer <token>`.

| Método | Rota | Operação |
|---|---|---|
| POST | /auth/register | Cria usuário e retorna token |
| POST | /auth/login | Retorna token |
| GET | /tasks | Lista tarefas |
| GET | /tasks/{id} | Obtém tarefa |
| POST | /tasks | Cria tarefa (201) |
| PUT | /tasks/{id} | Atualiza tarefa completa |
| DELETE | /tasks/{id} | Exclui (204) |

Tarefa: `{ "id", "title", "description", "done", "created_at" }` (data em ISO 8601; no Java o campo é `createdAt`, mapeado com `@JsonProperty("created_at")`).

## Frontend
- Rotas: `''` lista, `tasks/new` criar, `tasks/:id/edit` editar, `login`, `register`.
- `TasksService` expõe um `BehaviorSubject<Task[]>` (`tasks$`); a lista usa `async` pipe, `switchMap`, `combineLatest` e `takeUntil`.
- Interceptor adiciona o JWT e redireciona ao login em caso de 401; `authGuard` protege as rotas.
- Tailwind mobile first (`sm:`/`md:` para telas maiores).

## Testes
JUnit 5 + Mockito (`TaskServiceTest`) e Spring Boot Test/MockMvc (`TaskControllerTest`, `AuthFlowTest`).

## Fluxo de branches
```bash
git init && git add . && git commit -m "chore: estrutura inicial" && git branch -M main
git checkout -b backend/api-tarefas      # ... commits ... PR para main
git checkout -b frontend/spa-tarefas     # ... commits ... PR para main
```
