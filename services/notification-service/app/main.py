from fastapi import FastAPI

app = FastAPI(title="Notification Service")


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": "notification-service", "status": "ok"}
