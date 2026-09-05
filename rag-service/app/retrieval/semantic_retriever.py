from app.embeddings.bge_m3 import (
    BGEEmbeddingService,
)

from app.vectorstore.qdrant_store import (
    QdrantVectorStore,
)


class SemanticRetriever:

    def __init__(
        self,
        embedder,
        vector_store,
    ):
        self.embedder = embedder
        self.vector_store = vector_store


    def retrieve(
        self,
        query: str,
        top_k: int = 5,
    ):

        query_vector = (
            self.embedder.embed_query(
                query
            )
        )

        results = (
            self.vector_store.search(
                query_vector,
                limit=top_k,
            )
        )

        return [
            {
                "id": str(result.id),

                "score": result.score,

                "content":
                    result.payload.get(
                        "content",
                        "",
                    ),

                "metadata": {
                    key: value
                    for key, value
                    in result.payload.items()
                    if key != "content"
                },
            }
            for result in results
        ]