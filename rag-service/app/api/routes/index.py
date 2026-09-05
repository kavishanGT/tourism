from fastapi import APIRouter, Depends

from app.core.config import settings
from app.services.rag_dependencies import (
    get_vector_store,
)
from app.vectorstore.qdrant_store import (
    QdrantVectorStore,
)


router = APIRouter(
    prefix="/index",
    tags=["Index"],
)


@router.get("/status")
async def get_index_status(
    vector_store: QdrantVectorStore = Depends(
        get_vector_store
    ),
):
    try:
        info = vector_store.collection_info()

        vectors_count = getattr(
            info,
            "points_count",
            getattr(info, "vectors_count", 0),
        )

        vectors_config = info.config.params.vectors
        size = getattr(
            vectors_config,
            "size",
            settings.embedding_dimension,
        )
        distance = getattr(
            vectors_config,
            "distance",
            "Cosine",
        )

        distance_str = (
            distance.value
            if hasattr(distance, "value")
            else str(distance)
        )

        return {
            "success": True,
            "data": {
                "collection": settings.qdrant_collection,
                "vectors": vectors_count,
                "dimension": size,
                "distance": distance_str,
            },
        }
    except Exception as exc:
        return {
            "success": False,
            "error": str(exc),
            "data": {
                "collection": settings.qdrant_collection,
                "vectors": 0,
                "dimension": settings.embedding_dimension,
                "distance": "Cosine",
            },
        }
