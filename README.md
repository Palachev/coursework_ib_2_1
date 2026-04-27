# Microservices Task Manager (FastAPI + React)

Полноценный учебный проект для демонстрации **микросервисной архитектуры** с контейнеризацией.

Стек:
- **Backend**: FastAPI (API Gateway + Auth + Task + Notification)
- **Data**: PostgreSQL (отдельная БД для auth и task)
- **Frontend**: React + Vite (сборка и отдача через Nginx в Docker)
- **Orchestration**: Docker Compose

---

## 1) Что делает проект

Приложение реализует базовый контур управления задачами:
1. Пользователь регистрируется и логинится.
2. Получает JWT и работает с задачами через API Gateway.
3. Может просматривать/создавать уведомления.
4. Сервисы проверяются healthcheck-ами, поднимаются в общей сети `backend`.

Важно: текущая модель задач — **персональная** (по владельцу), а не командная постановка задач другим пользователям.

---

## 2) Архитектура

Сервисы:
- `frontend` — UI (React SPA, Nginx, `http://localhost:5173`)
- `api-gateway` — единая входная точка API (`http://localhost:8000`)
- `auth-service` — регистрация, вход, текущий пользователь (`/auth/*`)
- `task-service` — CRUD задач (`/tasks*`)
- `notification-service` — простые HTTP-уведомления (`/notifications`)
- `auth-db` — PostgreSQL для auth
- `task-db` — PostgreSQL для task

Сетевое взаимодействие внутри compose:
- Gateway проксирует в `auth-service`, `task-service`, `notification-service` по DNS-именам контейнеров.
- Базы не публикуются наружу, доступны только внутри сети `backend`.

---

## 3) Роли сервисов

### API Gateway
- Reverse proxy для `/auth`, `/tasks`, `/notifications`
- JWT middleware
- Request logging middleware
- CORS для frontend (`localhost:5173`)
- Public-пути: `/health`, `/docs`, `/openapi.json`, `/redoc`, `/auth/login`, `/auth/register`

### Auth Service
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /health`, `GET /health/db`
- Автосовместимость со старой схемой: если в таблице `users` нет `full_name`, колонка добавляется на старте.

### Task Service
- `POST /tasks`
- `GET /tasks`
- `GET /tasks/{task_id}`
- `PUT /tasks/{task_id}`
- `DELETE /tasks/{task_id}`
- `GET /health`, `GET /health/db`

### Notification Service
- `GET /notifications`
- `POST /notifications`
- `GET /health`

Ограничение: уведомления сейчас синхронные и in-memory (без брокера).

---

## 4) Healthchecks и устойчивость запуска

- Все сервисы имеют `/health`.
- DB-backed сервисы имеют `/health/db` с реальным `SELECT 1`.
- В compose healthcheck для сервисов настроен на `/health`.
- Для `auth-service` и `task-service` задан `start_period`, чтобы избежать ложных `unhealthy` при старте.
- `depends_on: condition: service_healthy` задаёт порядок старта.

---

## 5) Быстрый запуск (одной командой)

### Требования
- Docker + Docker Compose

### Шаги
```bash
cp .env.example .env
docker compose up --build
```

Открыть:
- Frontend UI: `http://localhost:5173`
- API Gateway docs: `http://localhost:8000/docs`
- Gateway health: `http://localhost:8000/health`

---

## 6) Переменные окружения

Базовые значения в `.env.example`:
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `JWT_SECRET_KEY`
- `AUTH_JWT_EXPIRE_MINUTES`

Рекомендуется задать сильный `JWT_SECRET_KEY` перед запуском.

---

## 7) Как проходит запрос (пример)

### Регистрация
1. Frontend → `POST /auth/register` (Gateway)
2. Gateway → `auth-service /auth/register`
3. Auth сохраняет пользователя в `auth-db`

### Получение задач
1. Frontend → `GET /tasks` + Bearer token
2. Gateway валидирует JWT и проксирует в `task-service`
3. Task service возвращает задачи текущего пользователя

---

## 8) Типичные проблемы и решения

### 1) `OPTIONS ... 401` в логах gateway
Причина: preflight CORS блокируется middleware.
Решение: в проекте OPTIONS уже пропускается до JWT-проверки.

### 2) `POST /auth/register -> 500`
Возможные причины:
- старый volume со старой схемой `users`
- проблемы bcrypt backend

Что уже учтено в проекте:
- авто-добавление `full_name` при старте auth-service
- более устойчивый password context (`pbkdf2_sha256` + `bcrypt`)

### 3) Пользователь не логинится после регистрации
Проверь:
- что register вернул `201`
- что пароль соответствует требованиям
- логи `auth-service` и `api-gateway`

Команды:
```bash
docker compose logs -f api-gateway
docker compose logs -f auth-service
```

---

## 9) Что важно для курсовой

Этот проект уже покрывает ключевые критерии:
- микросервисы с явным разделением ответственности
- API Gateway как единая точка входа
- контейнеризация и оркестрация
- healthchecks и порядок старта
- frontend + backend + БД в одном compose

Для защиты обычно достаточно:
1. показать архитектурную схему
2. поднять проект `docker compose up --build`
3. пройти сценарий: register → login → create task → create notification
4. показать `/docs` и `docker compose ps`

---

## 10) Дальнейшие улучшения (опционально)

- Командные задачи (назначение другим пользователям)
- Персонифицированные уведомления
- Асинхронный брокер (RabbitMQ/Redis Streams/Kafka)
- Refresh token flow
- Alembic-миграции
- CI (линтеры/тесты/сборка)
