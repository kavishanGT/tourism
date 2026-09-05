import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.retrieval.hybrid_rerank_retriever import (
    HybridRerankRetriever,
)
from app.retrieval.hybrid_retriever import (
    HybridRetriever,
)
from app.retrieval.semantic_retriever import (
    SemanticRetriever,
)
from app.services.rag_dependencies import (
    get_hybrid_rerank_retriever,
    get_hybrid_retriever,
    get_retriever,
)


router = APIRouter(
    prefix="/retrieval",
    tags=["Retrieval"],
)


class RetrievalRequest(BaseModel):

    query: str = Field(
        min_length=1,
        max_length=1000,
    )

    top_k: int = Field(
        default=10,
        ge=1,
        le=20,
    )

    candidate_k: int = Field(
        default=20,
        ge=5,
        le=100,
    )

    retrieval_mode: str = Field(
        default="dense",
        pattern="^(dense|hybrid|hybrid_rerank)$",
    )

    destination: str | None = None

    category: str | None = None


@router.post("")
async def retrieve(
    request: RetrievalRequest,
    dense_retriever: SemanticRetriever = Depends(
        get_retriever
    ),
    hybrid_retriever: HybridRetriever = Depends(
        get_hybrid_retriever
    ),
    hybrid_rerank_retriever: HybridRerankRetriever = Depends(
        get_hybrid_rerank_retriever
    ),
):
    start_time = time.perf_counter()

    if request.retrieval_mode == "dense":
        results = dense_retriever.retrieve(
            query=request.query,
            top_k=request.top_k,
        )
    elif request.retrieval_mode == "hybrid":
        results = hybrid_retriever.retrieve(
            query=request.query,
            top_k=request.top_k,
            candidate_k=request.candidate_k,
        )
    else:
        results = hybrid_rerank_retriever.retrieve(
            query=request.query,
            top_k=request.top_k,
            candidate_k=request.candidate_k,
        )

    elapsed_ms = round(
        (time.perf_counter() - start_time) * 1000,
        2,
    )

    return {
        "success": True,
        "data": {
            "query": request.query,
            "retrieval_mode": request.retrieval_mode,
            "latency_ms": elapsed_ms,
            "results": results,
        },
    }