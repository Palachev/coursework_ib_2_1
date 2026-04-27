from fastapi import APIRouter, Request

from app.config import settings
from app.proxy import forward_request

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(request: Request):
    return await forward_request(request, settings.notification_service_url, "notifications")


@router.post("")
async def create_notification(request: Request):
    return await forward_request(request, settings.notification_service_url, "notifications")


@router.api_route(
    "/{path:path}",
    methods=["GET", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
)
async def proxy_notifications_fallback(request: Request, path: str = ""):
    return await forward_request(request, settings.notification_service_url, f"notifications/{path}")
