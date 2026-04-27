from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TaskCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    status: str = Field(default="todo", pattern="^(todo|in_progress|done)$")


class TaskUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    status: str | None = Field(default=None, pattern="^(todo|in_progress|done)$")


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str | None
    status: str
    owner_user_id: UUID
    created_at: datetime
    updated_at: datetime
