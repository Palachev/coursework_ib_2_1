import logging

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.middleware import JWTAuthMiddleware, RequestLoggingMiddleware
from app.routers.auth import router as auth_router
from app.routers.notifications import router as notifications_router
from app.routers.tasks import router as tasks_router

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="API Gateway")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(JWTAuthMiddleware)

app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(notifications_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"service": "api-gateway", "status": "ok"}


@app.get("/health/downstream")
async def downstream_health() -> dict[str, object]:
    services = {
        "auth-service": f"{settings.auth_service_url}/health",
        "task-service": f"{settings.task_service_url}/health",
        "notification-service": f"{settings.notification_service_url}/health",
    }

    results: dict[str, object] = {}
    overall_ok = True

    async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
        for name, url in services.items():
            try:
                response = await client.get(url)
                results[name] = {"status_code": response.status_code, "body": response.json()}
                if response.status_code >= 400:
                    overall_ok = False
            except Exception as exc:
                results[name] = {"error": str(exc)}
                overall_ok = False

    return {"status": "ok" if overall_ok else "degraded", "services": results}
