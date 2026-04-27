from fastapi import FastAPI

app = FastAPI(title="Auth Service")


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": "auth-service", "status": "ok"}
