from fastapi import APIRouter, Request

from app.config import settings
from app.proxy import forward_request

router = APIRouter(prefix="/auth", tags=["auth"])


@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def proxy_auth(path: str, request: Request):
    return await forward_request(request, settings.auth_service_url, f"auth/{path}")
