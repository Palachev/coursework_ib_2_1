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

The auth service uses PostgreSQL and creates the `users` table at startup.
