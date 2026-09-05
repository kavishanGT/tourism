from pathlib import Path

import pymupdf

from app.ingestion.hashing import (
    calculate_file_hash,
    generate_document_id,
)
from app.ingestion.models import (
    Document,
    DocumentPage,
)


class PDFExtractor:

    def extract(
        self,
        file_path: Path,
        metadata: dict,
    ) -> Document:

        file_hash = calculate_file_hash(
            file_path
        )

        document_id = generate_document_id(
            file_hash
        )

        pdf = pymupdf.open(file_path)

        pages = []

        for page_index, page in enumerate(
            pdf
        ):

            text = page.get_text(
                "text"
            )

            page_metadata = {
                "page_number":
                    page_index + 1,
                "document_id":
                    document_id,
                "file_name":
                    file_path.name,
            }

            pages.append(
                DocumentPage(
                    page_number=page_index + 1,
                    text=text,
                    metadata=page_metadata,
                )
            )

        pdf_metadata = dict(
            pdf.metadata or {}
        )

        combined_text = "\n\n".join(
            page.text
            for page in pages
        )

        document_metadata = {
            **metadata,

            "document_id":
                document_id,

            "file_name":
                file_path.name,

            "file_path":
                str(file_path),

            "file_hash":
                file_hash,

            "file_size":
                file_path.stat().st_size,

            "page_count":
                len(pages),

            "pdf_title":
                pdf_metadata.get(
                    "title"
                ),

            "pdf_author":
                pdf_metadata.get(
                    "author"
                ),

            "pdf_subject":
                pdf_metadata.get(
                    "subject"
                ),
        }

        pdf.close()

        return Document(
            document_id=document_id,
            content=combined_text,
            metadata=document_metadata,
            pages=pages,
        )
