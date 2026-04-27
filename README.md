# Microservices Task Manager (FastAPI)

Production-like minimal microservices setup:
- `api-gateway` (routing, JWT middleware, request logging)
- `auth-service` (users + JWT + PostgreSQL)
- `task-service` (task CRUD + PostgreSQL)
- `notification-service` (simple HTTP notifications)

## Architecture improvements
- API Gateway now proxies HTTP requests to downstream services using service DNS names:
  - `http://auth-service:8000`
  - `http://task-service:8000`
  - `http://notification-service:8000`
- JWT validation happens at gateway middleware level.
- Request logging middleware added at gateway.
- DB services are internal-only (not exposed to host ports).
- `/health` on all services and `/health/db` on DB-backed services.
- Compose uses healthchecks + `depends_on: condition: service_healthy`.
- Shared network `backend` for all containers.

## Run
```bash
cp .env.example .env
docker compose up --build
```

Then open:
- Frontend UI: `http://localhost:5173`
- API Gateway docs: `http://localhost:8000/docs`

## Health endpoints
- Gateway: `GET /health`, `GET /health/downstream`
- Auth: `GET /health`, `GET /health/db`
- Task: `GET /health`, `GET /health/db`
- Notification: `GET /health`

## Notification service limitation
Current notification service is synchronous and in-memory. In production, use an async broker (Redis Streams, RabbitMQ, or Kafka) to decouple task events from notification delivery.
