from datetime import datetime, timezone
from pathlib import Path

from app.ingestion.chunker import (
    DocumentChunker,
)
from app.ingestion.cleaner import (
    TextCleaner,
)
from app.ingestion.hashing import (
    calculate_file_hash,
)
from app.ingestion.manifest import (
    ProcessingManifest,
    SourceManifest,
)
from app.ingestion.pdf_extractor import (
    PDFExtractor,
)


class IngestionPipeline:

    def __init__(
        self,
        source_manifest_path: Path,
        processing_manifest_path: Path,
    ):
        self.pdf_extractor = (
            PDFExtractor()
        )

        self.cleaner = TextCleaner()

        self.chunker = (
            DocumentChunker()
        )

        self.source_manifest = (
            SourceManifest(
                source_manifest_path
            )
        )

        self.processing_manifest = (
            ProcessingManifest(
                processing_manifest_path
            )
        )

    def process_file(
        self,
        file_path: Path,
    ):
        source = (
            self.source_manifest
            .find_by_filename(
                file_path.name
            )
        )

        if source is None:
            raise ValueError(
                "No source manifest entry "
                f"found for {file_path.name}"
            )

        file_hash = (
            calculate_file_hash(
                file_path
            )
        )

        existing = (
            self.processing_manifest
            .find_by_hash(
                file_hash
            )
        )

        if existing:
            return {
                "status": "duplicate",
                "document_id":
                    existing[
                        "document_id"
                    ],
                "chunks": [],
            }

        document = (
            self.pdf_extractor.extract(
                file_path,
                source,
            )
        )

        for page in document.pages:
            page.text = (
                self.cleaner.clean(
                    page.text
                )
            )

        total_characters = sum(
            len(page.text)
            for page in document.pages
        )

        if total_characters < 100:
            raise ValueError(
                f"PDF appears to contain "
                f"little/no extractable text: "
                f"{file_path.name}"
            )

        chunks = self.chunker.chunk(
            document
        )

        processing_record = {
            "document_id":
                document.document_id,

            "file_name":
                file_path.name,

            "file_hash":
                document.metadata[
                    "file_hash"
                ],

            "file_size":
                document.metadata[
                    "file_size"
                ],

            "page_count":
                document.metadata[
                    "page_count"
                ],

            "title":
                source.get(
                    "title"
                ),

            "category":
                source.get(
                    "category"
                ),

            "destination":
                source.get(
                    "destination"
                ),

            "language":
                source.get(
                    "language"
                ),

            "source_name":
                source.get(
                    "source_name"
                ),

            "source_type":
                source.get(
                    "source_type"
                ),

            "source_url":
                source.get(
                    "source_url"
                ),

            "trust_level":
                source.get(
                    "trust_level"
                ),

            "status":
                "processed",

            "processed_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),

            "chunk_count":
                len(chunks),
        }

        self.processing_manifest.add(
            processing_record
        )

        return {
            "status": "processed",
            "document_id":
                document.document_id,
            "chunks": chunks,
            "manifest":
                processing_record,
        }

    def process_directory(
        self,
        directory: Path,
    ):
        results = []

        for file_path in sorted(
            directory.rglob("*")
        ):
            if (
                file_path.is_file()
                and file_path.suffix.lower()
                == ".pdf"
            ):
                try:
                    result = (
                        self.process_file(
                            file_path
                        )
                    )

                    results.append(result)

                except Exception as exc:
                    results.append({
                        "status": "failed",
                        "file_name":
                            file_path.name,
                        "error": str(exc),
                    })

        return results
