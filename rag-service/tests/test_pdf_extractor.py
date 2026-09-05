from pathlib import Path

import pymupdf

from app.ingestion.pdf_extractor import (
    PDFExtractor,
)


def test_pdf_extraction(
    tmp_path: Path,
):
    doc = pymupdf.open()

    page = doc.new_page()
    page.insert_text(
        (50, 50),
        "Hello Ella Tourism",
    )
    pdf_path = (
        tmp_path / "sample.pdf"
    )
    doc.save(str(pdf_path))
    doc.close()

    extractor = PDFExtractor()

    document = extractor.extract(
        pdf_path,
        {
            "title": "Test PDF",
            "category": "destination",
        },
    )

    assert len(document.pages) > 0
    assert (
        document.metadata[
            "page_count"
        ]
        > 0
    )
    assert (
        "Hello Ella Tourism"
        in document.content
    )
