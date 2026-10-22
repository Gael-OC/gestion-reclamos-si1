from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.v1.router import router as api_v1_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    description="Prototipo académico ficticio UCN 2026, sin relación institucional con SERNAC.",
    version="0.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(api_v1_router, prefix="/api/v1")
