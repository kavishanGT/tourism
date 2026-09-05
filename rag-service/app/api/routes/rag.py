from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.rag.models import UserPersonalizationContext
from app.services.rag_dependencies import get_rag_service

router = APIRouter(
    prefix="/rag",
    tags=["RAG"],
)


class RAGRequest(BaseModel):
    query: str = Field(
        min_length=1,
        max_length=2000,
        description="The user query or question for the AI assistant",
    )

    retrieval_mode: str = Field(
        default="auto",
        pattern="^(auto|hybrid_db|hybrid_rerank|hybrid|dense)$",
        description="Retrieval mode strategy (auto intent routing, hybrid_db, hybrid_rerank, hybrid, dense)",
    )

    top_k: int = Field(
        default=5,
        ge=1,
        le=10,
    )

    candidate_k: int = Field(
        default=20,
        ge=5,
        le=50,
    )

    user_context: UserPersonalizationContext | None = Field(
        default=None,
        description="Personalization context for authenticated users (profile, favorites, saved trips)",
    )


@router.post("/ask")
async def ask(
    request: RAGRequest,
    rag_service=Depends(get_rag_service),
):
    return await rag_service.answer(
        query=request.query,
        retrieval_mode=request.retrieval_mode,
        top_k=request.top_k,
        candidate_k=request.candidate_k,
        user_context=request.user_context,
    )
