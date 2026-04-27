# Microservices Task Manager (FastAPI)

Simple student-friendly microservices project with separate services and Docker orchestration.

## Services
- `api-gateway`
- `auth-service`
- `task-service`
- `notification-service`

Each service has its own `Dockerfile` inside `services/<service-name>/`.

## Run everything with Docker Compose
1. Copy env file:
   ```bash
   cp .env.example .env
   ```
2. Build and start all containers:
   ```bash
   docker compose up --build
   ```

## Ports
- API Gateway: `http://localhost:8000`
- Auth Service: `http://localhost:8001`
- Task Service: `http://localhost:8002`
- Notification Service: `http://localhost:8003`
- Auth DB: `localhost:5433`
- Task DB: `localhost:5434`
