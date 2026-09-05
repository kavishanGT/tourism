from app.retrieval.rrf import (
    reciprocal_rank_fusion,
)


class HybridRetriever:

    def __init__(
        self,
        semantic_retriever,
        bm25_retriever,
    ):

        self.semantic_retriever = (
            semantic_retriever
        )

        self.bm25_retriever = (
            bm25_retriever
        )

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        candidate_k: int = 20,
    ):

        semantic_results = (
            self.semantic_retriever.retrieve(
                query=query,
                top_k=candidate_k,
            )
        )

        bm25_results = (
            self.bm25_retriever.retrieve(
                query=query,
                top_k=candidate_k,
            )
        )

        fused_results = (
            reciprocal_rank_fusion(
                [
                    semantic_results,
                    bm25_results,
                ]
            )
        )

        return fused_results[:top_k]