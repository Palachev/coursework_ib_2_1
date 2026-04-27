from fastapi import FastAPI

app = FastAPI(title="Task Service")


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": "task-service", "status": "ok"}
