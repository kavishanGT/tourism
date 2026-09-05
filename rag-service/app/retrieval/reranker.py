from sentence_transformers import CrossEncoder

from app.core.config import settings


class TourismReranker:

    def __init__(
        self,
        model_name: str | None = None,
        device: str | None = None,
        model=None,
    ):
        model_name = model_name or settings.reranker_model
        device = device or settings.reranker_device

        self.model = model or CrossEncoder(
            model_name,
            device=device,
        )

    def rerank(
        self,
        query: str,
        candidates: list[dict],
        top_k: int = 5,
    ) -> list[dict]:
        if not candidates:
            return []

        eval_candidates = candidates[:8]
        pairs = [
            [query, candidate.get("content", "")]
            for candidate in eval_candidates
        ]

        scores = self.model.predict(pairs, batch_size=8)

        reranked = []
        for candidate, score in zip(eval_candidates, scores):
            item = candidate.copy()
            item["rerank_score"] = float(score)
            reranked.append(item)

        reranked.sort(
            key=lambda x: x["rerank_score"],
            reverse=True,
        )

        return reranked[:top_k]