from fastapi import FastAPI

from .config import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name, debug=settings.debug)


@app.get("/health", summary="Service health check")
def health() -> dict[str, str]:
    """Expose simple health status for infrastructure probes."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="0.0.0.0", port=settings.port, reload=settings.debug)
