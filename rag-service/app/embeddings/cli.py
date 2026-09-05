from pathlib import Path

from app.embeddings.indexer import (
    ChunkLoader,
    VectorIndexer,
)


CHUNKS_FILE = Path(
    "data/processed/chunks.jsonl"
)


def main():
    print("Loading chunks...")

    loader = ChunkLoader()

    chunks = loader.load(
        CHUNKS_FILE
    )

    print(
        f"Loaded {len(chunks)} chunks."
    )

    print(
        "Initializing embedding model..."
    )

    indexer = VectorIndexer()

    result = indexer.index(
        chunks,
        recreate=False,
    )

    print()
    print(
        "========== INDEXING REPORT =========="
    )
    print(
        f"Documents indexed: "
        f"{result.get('documents_indexed', 0)}"
    )
    print(
        f"Chunks indexed   : "
        f"{result.get('chunks_indexed', 0)}"
    )
    print(
        f"Embedding dim    : "
        f"{result.get('embedding_dimension', 0)}"
    )
    print(
        "====================================="
    )


if __name__ == "__main__":
    main()