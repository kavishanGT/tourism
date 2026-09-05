import json
from pathlib import Path

from app.ingestion.models import (
    DocumentChunk,
)


class CorpusLoader:

    @staticmethod
    def load(
        path: Path,
    ) -> list[DocumentChunk]:

        chunks = []

        with path.open(
            "r",
            encoding="utf-8",
        ) as file:

            for line in file:

                if not line.strip():
                    continue

                record = json.loads(
                    line
                )

                chunks.append(
                    DocumentChunk(
                        chunk_id=record["id"],
                        content=record["content"],
                        metadata=record[
                            "metadata"
                        ],
                    )
                )

        return chunks