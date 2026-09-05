import json
from pathlib import Path

from app.ingestion.models import (
    DocumentChunk,
)


class ChunkStorage:

    def save_jsonl(
        self,
        chunks: list[DocumentChunk],
        output_path: Path,
    ):
        output_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with output_path.open(
            "w",
            encoding="utf-8",
        ) as file:
            for chunk in chunks:
                record = {
                    "id": chunk.chunk_id,
                    "content": chunk.content,
                    "metadata": chunk.metadata,
                }

                file.write(
                    json.dumps(
                        record,
                        ensure_ascii=False,
                    )
                    + "\n"
                )
