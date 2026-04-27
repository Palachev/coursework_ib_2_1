import logging
import time

from fastapi import HTTPException, Request
from jose import JWTError, jwt
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

from app.config import settings

logger = logging.getLogger("gateway")

PUBLIC_PREFIXES = (
    "/health",
    "/docs",
    "/openapi.json",
    "/redoc",
    "/docs/oauth2-redirect",
    "/auth/login",
    "/auth/register",
)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        latency_ms = (time.perf_counter() - start) * 1000
        logger.info("%s %s -> %s (%.2f ms)", request.method, request.url.path, response.status_code, latency_ms)
        return response


class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        if request.url.path.startswith(PUBLIC_PREFIXES):
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Missing bearer token"})

        token = auth_header.removeprefix("Bearer ").strip()

        if not settings.jwt_secret_key:
            raise HTTPException(status_code=500, detail="Gateway JWT secret is not configured")

        try:
            payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
            request.state.user_email = payload.get("sub")
        except JWTError:
            return JSONResponse(status_code=401, content={"detail": "Invalid or expired token"})

        return await call_next(request)
