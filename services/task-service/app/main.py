from uuid import UUID

from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db, wait_for_db
from app.models import Task
from app.schemas import TaskCreateRequest, TaskResponse, TaskUpdateRequest

app = FastAPI(title="Task Service")


@app.on_event("startup")
def on_startup() -> None:
    wait_for_db()
    Base.metadata.create_all(bind=engine)


def get_current_user_id(x_user_id: str = Header(..., alias="X-User-Id")) -> UUID:
    try:
        return UUID(x_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid X-User-Id header") from exc


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": "task-service", "status": "ok"}


@app.get("/health/db")
def health_db(db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
        return {"service": "task-service", "status": "ok"}
    except SQLAlchemyError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable")


@app.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreateRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Task:
    task = Task(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        owner_user_id=user_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get("/tasks", response_model=list[TaskResponse])
def list_tasks(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)) -> list[Task]:
    return db.query(Task).filter(Task.owner_user_id == user_id).order_by(Task.created_at.desc()).all()


@app.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: UUID, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)) -> Task:
    task = db.query(Task).filter(Task.id == task_id, Task.owner_user_id == user_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: UUID,
    payload: TaskUpdateRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Task:
    task = db.query(Task).filter(Task.id == task_id, Task.owner_user_id == user_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.status is not None:
        task.status = payload.status

    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Response:
    task = db.query(Task).filter(Task.id == task_id, Task.owner_user_id == user_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db.delete(task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
