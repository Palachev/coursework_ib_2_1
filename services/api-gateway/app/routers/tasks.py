from fastapi import APIRouter, Request

from app.config import settings
from app.proxy import forward_request

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.api_route("", methods=["GET", "POST"])
@router.api_route("/{path:path}", methods=["GET", "PUT", "PATCH", "DELETE"])
async def proxy_tasks(request: Request, path: str = ""):
    return await forward_request(request, settings.task_service_url, f"tasks/{path}" if path else "tasks")
