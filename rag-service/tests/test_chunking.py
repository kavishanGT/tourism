from app.ingestion.chunker import (
    DocumentChunker,
)
from app.ingestion.models import (
    Document,
    DocumentPage,
)


def test_page_aware_chunking():
    document = Document(
        document_id="doc_test",
        content="",
        metadata={
            "title": "Test",
            "category": "destination",
            "destination": "Ella",
        },
        pages=[
            DocumentPage(
                page_number=10,
                text=(
                    "# Ella\n\n"
                    "Ella is a hill "
                    "country destination."
                ),
            )
        ],
    )

    chunker = DocumentChunker()

    chunks = chunker.chunk(
        document
    )

    assert len(chunks) > 0

    chunk = chunks[0]

    assert (
        chunk.metadata[
            "page_number"
        ] == 10
    )

    assert (
        chunk.metadata[
            "destination"
        ] == "Ella"
    )

    assert chunk.chunk_id.startswith(
        "doc_test-p0010"
    )
