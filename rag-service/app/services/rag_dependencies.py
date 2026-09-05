import logging
from functools import lru_cache
from pathlib import Path

from app.embeddings.bge_m3 import BGEEmbeddingService
from app.llm.base import BaseLLM
from app.llm.openai_llm import OpenAILLM
from app.rag.citation_validator import CitationValidator
from app.rag.generator import RAGGenerator
from app.rag.hybrid_context_builder import HybridContextBuilder
from app.rag.query_router import QueryRouter
from app.rag.service import RAGService
from app.retrieval.bm25_retriever import BM25Retriever
from app.retrieval.corpus_loader import CorpusLoader
from app.retrieval.db_retriever import StructuredDBRetriever
from app.retrieval.hybrid_rerank_retriever import HybridRerankRetriever
from app.retrieval.hybrid_retriever import HybridRetriever
from app.retrieval.reranker import TourismReranker
from app.retrieval.semantic_retriever import SemanticRetriever
from app.vectorstore.qdrant_store import QdrantVectorStore

logger = logging.getLogger(__name__)

CHUNKS_FILE = Path("data/processed/chunks.jsonl")


@lru_cache
def get_embedding_service() -> BGEEmbeddingService:
    return BGEEmbeddingService()


@lru_cache
def get_vector_store() -> QdrantVectorStore:
    return QdrantVectorStore()


@lru_cache
def get_retriever() -> SemanticRetriever:
    return SemanticRetriever(
        embedder=get_embedding_service(),
        vector_store=get_vector_store(),
    )


@lru_cache
def get_bm25_retriever() -> BM25Retriever:
    chunks = CorpusLoader.load(CHUNKS_FILE)
    return BM25Retriever(chunks=chunks)


@lru_cache
def get_hybrid_retriever() -> HybridRetriever:
    return HybridRetriever(
        semantic_retriever=get_retriever(),
        bm25_retriever=get_bm25_retriever(),
    )


@lru_cache
def get_reranker() -> TourismReranker | None:
    try:
        return TourismReranker()
    except Exception as e:
        logger.warning(f"TourismReranker initialization skipped: {e}")
        return None


@lru_cache
def get_hybrid_rerank_retriever() -> HybridRerankRetriever | None:
    reranker = get_reranker()
    if not reranker:
        return None
    return HybridRerankRetriever(
        hybrid_retriever=get_hybrid_retriever(),
        reranker=reranker,
    )


@lru_cache
def get_llm() -> BaseLLM:
    return OpenAILLM()


@lru_cache
def get_db_retriever() -> StructuredDBRetriever:
    return StructuredDBRetriever()


@lru_cache
def get_query_router() -> QueryRouter:
    return QueryRouter()


@lru_cache
def get_hybrid_context_builder() -> HybridContextBuilder:
    return HybridContextBuilder()


@lru_cache
def get_citation_validator() -> CitationValidator:
    return CitationValidator()


@lru_cache
def get_rag_generator() -> RAGGenerator:
    return RAGGenerator(
        llm=get_llm(),
        context_builder=get_hybrid_context_builder(),
        citation_validator=get_citation_validator(),
    )


@lru_cache
def get_rag_service() -> RAGService:
    return RAGService(
        dense_retriever=get_retriever(),
        hybrid_retriever=get_hybrid_retriever(),
        hybrid_rerank_retriever=get_hybrid_rerank_retriever(),
        generator=get_rag_generator(),
        db_retriever=get_db_retriever(),
        query_router=get_query_router(),
    )
