import re

from app.ingestion.models import (
    Document,
    DocumentChunk,
)


HEADING_PATTERN = re.compile(
    r"^(#{1,6}\s+.+|"
    r"\d+(?:\.\d+)*\.?\s+[A-Z].+)$"
)


class DocumentChunker:

    def __init__(
        self,
        max_characters: int = 3500,
        overlap: int = 400,
    ):
        self.max_characters = (
            max_characters
        )

        self.overlap = overlap

    def chunk(
        self,
        document: Document,
    ) -> list[DocumentChunk]:

        chunks = []

        for page in document.pages:

            page_chunks = (
                self._chunk_page(
                    document,
                    page.page_number,
                    page.text,
                )
            )

            chunks.extend(
                page_chunks
            )

        return chunks

    def _chunk_page(
        self,
        document: Document,
        page_number: int,
        text: str,
    ) -> list[DocumentChunk]:

        lines = text.splitlines()

        sections = []

        current_heading = None
        current_lines = []

        for line in lines:

            line = line.strip()

            if not line:
                continue

            if HEADING_PATTERN.match(line):

                if current_lines:

                    sections.append(
                        (
                            current_heading,
                            "\n".join(
                                current_lines
                            ),
                        )
                    )

                current_heading = line

                current_lines = []

            else:

                current_lines.append(line)

        if current_lines:

            sections.append(
                (
                    current_heading,
                    "\n".join(
                        current_lines
                    ),
                )
            )

        return self._build_chunks(
            document,
            page_number,
            sections,
        )

    def _build_chunks(
        self,
        document: Document,
        page_number: int,
        sections,
    ) -> list[DocumentChunk]:

        chunks = []

        for heading, text in sections:

            if not text.strip():
                continue

            section_text = ""

            if heading:

                section_text = (
                    heading
                    + "\n\n"
                )

            section_text += text

            if (
                len(section_text)
                <= self.max_characters
            ):

                chunks.append(
                    self._create_chunk(
                        document,
                        page_number,
                        heading,
                        section_text,
                        len(chunks),
                    )
                )

            else:

                chunks.extend(
                    self._split_large_section(
                        document,
                        page_number,
                        heading,
                        section_text,
                    )
                )

        return chunks

    def _split_large_section(
        self,
        document: Document,
        page_number: int,
        heading: str | None,
        text: str,
    ) -> list[DocumentChunk]:

        chunks = []

        start = 0
        chunk_index = 0

        while start < len(text):

            end = (
                start
                + self.max_characters
            )

            chunk_text = text[
                start:end
            ].strip()

            if chunk_text:

                chunks.append(
                    self._create_chunk(
                        document,
                        page_number,
                        heading,
                        chunk_text,
                        chunk_index,
                    )
                )

                chunk_index += 1

            if end >= len(text):
                break

            start = (
                end - self.overlap
            )

        return chunks

    def _create_chunk(
        self,
        document: Document,
        page_number: int,
        heading: str | None,
        text: str,
        index: int,
    ) -> DocumentChunk:

        chunk_id = (
            f"{document.document_id}"
            f"-p{page_number:04d}"
            f"-c{index:04d}"
        )

        metadata = document.metadata.copy()

        metadata.update({
            "chunk_id": chunk_id,
            "page_number": page_number,
            "section": heading,
            "chunk_index": index,
        })

        return DocumentChunk(
            chunk_id=chunk_id,
            content=text,
            metadata=metadata,
        )
