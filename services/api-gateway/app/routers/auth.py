from fastapi import APIRouter, Request

from app.config import settings
from app.proxy import forward_request

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(request: Request):
    return await forward_request(request, settings.auth_service_url, "auth/register")


@router.post("/login")
async def login(request: Request):
    return await forward_request(request, settings.auth_service_url, "auth/login")


@router.get("/me")
async def me(request: Request):
    return await forward_request(request, settings.auth_service_url, "auth/me")


@router.api_route(
    "/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
)
async def proxy_auth_fallback(path: str, request: Request):
    return await forward_request(request, settings.auth_service_url, f"auth/{path}")
