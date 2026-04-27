from fastapi import APIRouter, Request

from app.config import settings
from app.proxy import forward_request

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("")
async def list_tasks(request: Request):
    return await forward_request(request, settings.task_service_url, "tasks")


@router.post("")
async def create_task(request: Request):
    return await forward_request(request, settings.task_service_url, "tasks")


@router.get("/{task_id}")
async def get_task(task_id: str, request: Request):
    return await forward_request(request, settings.task_service_url, f"tasks/{task_id}")


@router.put("/{task_id}")
async def update_task(task_id: str, request: Request):
    return await forward_request(request, settings.task_service_url, f"tasks/{task_id}")


@router.delete("/{task_id}")
async def delete_task(task_id: str, request: Request):
    return await forward_request(request, settings.task_service_url, f"tasks/{task_id}")


@router.api_route("/{path:path}", methods=["PATCH"], include_in_schema=False)
async def proxy_tasks_patch_fallback(path: str, request: Request):
    return await forward_request(request, settings.task_service_url, f"tasks/{path}")
