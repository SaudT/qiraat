from fastapi import FastAPI

from app.core.database import init_db
from app.models.recitation import Recitation  # noqa: F401
from app.routes.recitation_routes import router as recitation_router

app = FastAPI(
    title="Qiraat Backend",
    description="Backend API for the Qiraat Quran recitations platform.",
    version="0.1.0",
)

app.include_router(recitation_router, prefix="/api/v1")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
