from rank_bm25 import BM25Okapi

from app.ingestion.models import (
    DocumentChunk,
)


class BM25Retriever:

    def __init__(
        self,
        chunks: list[DocumentChunk],
    ):

        self.chunks = chunks

        self.tokenized_corpus = [
            self.tokenize(chunk.content)
            for chunk in chunks
        ]

        self.bm25 = BM25Okapi(
            self.tokenized_corpus
        )

    @staticmethod
    def tokenize(text: str):

        return text.lower().split()

    def retrieve(
        self,
        query: str,
        top_k: int = 10,
    ):

        tokenized_query = self.tokenize(
            query
        )

        scores = self.bm25.get_scores(
            tokenized_query
        )

        ranked_indices = sorted(
            range(len(scores)),
            key=lambda i: scores[i],
            reverse=True,
        )[:top_k]

        results = []

        for index in ranked_indices:

            chunk = self.chunks[index]

            results.append({
                "id": chunk.chunk_id,
                "score": float(
                    scores[index]
                ),
                "content": chunk.content,
                "metadata": chunk.metadata,
            })

        return results