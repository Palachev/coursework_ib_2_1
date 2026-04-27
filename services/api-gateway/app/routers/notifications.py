from fastapi import APIRouter, Request

from app.config import settings
from app.proxy import forward_request

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.api_route("", methods=["GET", "POST"])
@router.api_route("/{path:path}", methods=["GET", "PUT", "PATCH", "DELETE"])
async def proxy_notifications(request: Request, path: str = ""):
    target = f"notifications/{path}" if path else "notifications"
    return await forward_request(request, settings.notification_service_url, target)
