from pathlib import Path

from app.ingestion.pipeline import (
    IngestionPipeline,
)
from app.ingestion.storage import (
    ChunkStorage,
)


DOCUMENTS_DIR = Path(
    "data/documents"
)

SOURCE_MANIFEST = Path(
    "data/documents/sources.yaml"
)

PROCESSING_MANIFEST = Path(
    "data/manifests/documents.json"
)

OUTPUT = Path(
    "data/processed/chunks.jsonl"
)


def main():
    pipeline = IngestionPipeline(
        source_manifest_path=
            SOURCE_MANIFEST,

        processing_manifest_path=
            PROCESSING_MANIFEST,
    )

    results = (
        pipeline.process_directory(
            DOCUMENTS_DIR
        )
    )

    all_chunks = []
    processed = 0
    duplicates = 0
    failed = 0

    for result in results:
        status = result[
            "status"
        ]

        if status == "processed":
            processed += 1
            all_chunks.extend(
                result["chunks"]
            )
            print(
                f"[OK] Processed: "
                f"{result['document_id']}"
            )

        elif status == "duplicate":
            duplicates += 1
            print(
                f"[DUP] Duplicate: "
                f"{result['document_id']}"
            )

        else:
            failed += 1
            print(
                f"[FAIL] Failed: "
                f"{result.get('file_name')}"
            )
            print(
                f"  Error: {result.get('error')}"
            )

    storage = ChunkStorage()

    storage.save_jsonl(
        all_chunks,
        OUTPUT,
    )

    print()
    print("========== INGESTION REPORT ==========")
    print(f"Processed : {processed}")
    print(f"Duplicates: {duplicates}")
    print(f"Failed    : {failed}")
    print(f"Chunks    : {len(all_chunks)}")
    print("======================================")


if __name__ == "__main__":
    main()
