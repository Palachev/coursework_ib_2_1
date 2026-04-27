from typing import Any

import httpx
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from app.config import settings


async def forward_request(request: Request, service_base_url: str, path: str = "") -> JSONResponse:
    target_url = f"{service_base_url.rstrip('/')}/{path.lstrip('/')}"
    method = request.method
    query_params = dict(request.query_params)

    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in {"host", "content-length", "connection"}
    }

    body: Any = None
    if method in {"POST", "PUT", "PATCH"}:
        body = await request.body()

    try:
        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            response = await client.request(
                method=method,
                url=target_url,
                params=query_params,
                content=body,
                headers=headers,
            )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Downstream service unavailable: {exc}") from exc

    content_type = response.headers.get("content-type", "")
    if "application/json" in content_type:
        return JSONResponse(status_code=response.status_code, content=response.json())

    return JSONResponse(status_code=response.status_code, content={"detail": response.text})
