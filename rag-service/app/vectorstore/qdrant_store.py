import uuid
from typing import Any

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    PointStruct,
    VectorParams,
)

from qdrant_client.models import (
    Filter,
    FieldCondition,
    MatchValue,
)

from app.core.config import settings


class QdrantVectorStore:

    def __init__(self):
        self.client = QdrantClient(
            url=settings.qdrant_url
        )
        self.collection_name = (
            settings.qdrant_collection
        )

    def create_collection(
        self,
        recreate: bool = False,
    ):
        exists = (
            self.client.collection_exists(
                self.collection_name
            )
        )

        if exists and recreate:
            self.client.delete_collection(
                self.collection_name
            )
            exists = False

        if not exists:
            self.client.create_collection(
                collection_name=
                    self.collection_name,
                vectors_config=VectorParams(
                    size=settings.embedding_dimension,
                    distance=Distance.COSINE,
                ),
            )

    def upsert_chunks(
        self,
        chunks: list[Any],
        embeddings: list[list[float]],
        batch_size: int = 100,
    ):
        points = []

        for chunk, embedding in zip(
            chunks,
            embeddings,
        ):
            # Generate deterministic UUID for Qdrant Point ID from chunk_id string
            point_id = str(
                uuid.uuid5(
                    uuid.NAMESPACE_DNS,
                    chunk.chunk_id,
                )
            )

            points.append(
                PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload={
                        "chunk_id":
                            chunk.chunk_id,
                        "content":
                            chunk.content,
                        **chunk.metadata,
                    },
                )
            )

        # Batch upsert points into Qdrant
        for i in range(
            0,
            len(points),
            batch_size,
        ):
            batch = points[
                i : i + batch_size
            ]
            self.client.upsert(
                collection_name=
                    self.collection_name,
                points=batch,
            )

    def build_filter(
        self,
        destination=None,
        category=None,
    ):

        conditions = []

        if destination:

            conditions.append(
                FieldCondition(
                    key="destination",
                    match=MatchValue(
                        value=destination
                    ),
                )
            )

        if category:

            conditions.append(
                FieldCondition(
                    key="category",
                    match=MatchValue(
                        value=category
                    ),
                )
            )

        if not conditions:

            return None

        return Filter(
            must=conditions
        )

    def search(
        self,
        query_vector: list[float],
        limit: int = 5,
        query_filter=None

    ):

        results = (
            self.client.query_points(
                collection_name=
                    self.collection_name,

                query=query_vector,

                query_filter=query_filter,

                limit=limit,

                with_payload=True,
            )
        )

        return results.points

    def collection_info(self):
        return self.client.get_collection(
            self.collection_name
        )