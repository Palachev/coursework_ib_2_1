# Microservices Task Manager (FastAPI)

Simple student-friendly microservices scaffold with separate FastAPI services and Docker support.

## Services
- `api-gateway`
- `auth-service`
- `task-service`
- `notification-service`

## Run
```bash
docker compose up --build
```

## Auth service features
- `POST /auth/register` — register a user with `email`, `full_name`, `password`
- `POST /auth/login` — login and receive a JWT bearer token
- `GET /auth/me` — get current user via `Authorization: Bearer <token>`

## Task service features
- `POST /tasks` — create task for user from `X-User-Id` header
- `GET /tasks` — list current user's tasks
- `GET /tasks/{task_id}` — get one task owned by current user
- `PUT /tasks/{task_id}` — update one task owned by current user
- `DELETE /tasks/{task_id}` — delete one task owned by current user

The auth service uses PostgreSQL and creates the `users` table at startup.
The task service uses PostgreSQL and creates the `tasks` table at startup.
