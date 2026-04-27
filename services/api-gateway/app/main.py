from fastapi import FastAPI

app = FastAPI(title="API Gateway")


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": "api-gateway", "status": "ok"}
