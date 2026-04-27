from datetime import datetime
from typing import Any

from fastapi import FastAPI

app = FastAPI(title="Notification Service")

NOTIFICATIONS: list[dict[str, Any]] = []


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": "notification-service", "status": "ok"}


@app.get("/notifications")
def list_notifications() -> list[dict[str, Any]]:
    return NOTIFICATIONS


@app.post("/notifications")
def create_notification(payload: dict[str, Any]) -> dict[str, Any]:
    notification = {
        "id": len(NOTIFICATIONS) + 1,
        "message": payload.get("message", ""),
        "created_at": datetime.utcnow().isoformat(),
    }
    NOTIFICATIONS.append(notification)
    return notification
