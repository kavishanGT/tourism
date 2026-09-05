from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI

from app.api.routes.health import router as health_router
from app.api.routes.index import router as index_router
from app.api.routes.rag import router as rag_router
from app.api.routes.retrieval import router as retrieval_router
from app.core.config import settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Pre-warming RAG models and search indexes on startup...")
    try:
        from app.services.rag_dependencies import get_rag_service
        get_rag_service()
        logger.info("RAG models and search indexes successfully warmed up.")
    except Exception as e:
        logger.warning(f"Error during RAG warmup: {e}")
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered RAG service for the Sri Lanka Tourism platform.",
    lifespan=lifespan,
)

app.include_router(
    health_router,
    prefix="/api/v1/rag",
)

app.include_router(
    retrieval_router,
    prefix="/api/v1/rag",
)

app.include_router(
    index_router,
    prefix="/api/v1/rag",
)

app.include_router(
    rag_router,
    prefix="/api/v1",
)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running",
    }