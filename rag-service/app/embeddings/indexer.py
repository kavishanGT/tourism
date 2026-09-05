import json
from pathlib import Path
from typing import Any

from app.embeddings.bge_m3 import (
    BGEEmbeddingService,
)
from app.ingestion.models import (
    DocumentChunk,
)
from app.vectorstore.index_manifest import (
    IndexManifest,
)
from app.vectorstore.qdrant_store import (
    QdrantVectorStore,
)


class ChunkLoader:

    def load(
        self,
        path: Path,
    ) -> list[DocumentChunk]:
        chunks = []

        if not path.exists():
            return chunks

        with path.open(
            "r",
            encoding="utf-8",
        ) as file:
            for line in file:
                if not line.strip():
                    continue

                record = json.loads(line)

                chunks.append(
                    DocumentChunk(
                        chunk_id=record["id"],
                        content=record["content"],
                        metadata=record["metadata"],
                    )
                )

        return chunks


class VectorIndexer:

    def __init__(
        self,
        embedder=None,
        vector_store=None,
        manifest_path: Path = Path("data/manifests/index.json"),
    ):
        self.embedder = (
            embedder
            or BGEEmbeddingService()
        )
        self.vector_store = (
            vector_store
            or QdrantVectorStore()
        )
        self.index_manifest = (
            IndexManifest(
                manifest_path
            )
        )

    def get_documents_to_index(
        self,
        chunks: list[DocumentChunk],
    ) -> list[tuple[str, dict[str, Any]]]:
        documents: dict[str, dict[str, Any]] = {}

        for chunk in chunks:
            document_id = chunk.metadata.get(
                "document_id",
                "unknown",
            )
            file_hash = chunk.metadata.get(
                "file_hash",
                "",
            )

            documents.setdefault(
                document_id,
                {
                    "file_hash": file_hash,
                    "chunks": [],
                },
            )
            documents[document_id]["chunks"].append(chunk)

        documents_to_index = []

        for document_id, info in documents.items():
            existing = (
                self.index_manifest
                .get_document(
                    document_id
                )
            )

            if existing is None:
                documents_to_index.append(
                    (
                        document_id,
                        info,
                    )
                )
                continue

            if (
                existing.get("file_hash")
                != info["file_hash"]
            ):
                documents_to_index.append(
                    (
                        document_id,
                        info,
                    )
                )

        return documents_to_index

    def index(
        self,
        chunks: list[DocumentChunk],
        recreate: bool = False,
    ) -> dict[str, Any]:
        self.vector_store.create_collection(
            recreate=recreate
        )

        documents = (
            self.get_documents_to_index(
                chunks
            )
        )

        if not documents:
            return {
                "documents_indexed": 0,
                "chunks_indexed": 0,
                "embedding_dimension": 0,
            }

        total_chunks = 0
        last_embedding_dim = 0

        for document_id, info in documents:
            document_chunks = info[
                "chunks"
            ]
            texts = [
                chunk.content
                for chunk in document_chunks
            ]

            embeddings = (
                self.embedder
                .embed_documents(
                    texts
                )
            )
            if embeddings:
                last_embedding_dim = len(embeddings[0])

            self.vector_store.upsert_chunks(
                document_chunks,
                embeddings,
            )

            self.index_manifest.upsert_document(
                document_id=document_id,
                file_hash=info[
                    "file_hash"
                ],
                chunk_count=len(
                    document_chunks
                ),
            )

            total_chunks += len(
                document_chunks
            )

        return {
            "documents_indexed":
                len(documents),
            "chunks_indexed":
                total_chunks,
            "embedding_dimension":
                last_embedding_dim,
        }