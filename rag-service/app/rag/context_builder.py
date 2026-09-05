from app.rag.models import (
    SourceCitation,
)


class ContextBuilder:

    def build(
        self,
        results: list[dict],
    ):
        contexts = []
        citations = []

        for index, result in enumerate(
            results,
            start=1,
        ):
            metadata = result.get(
                "metadata",
                {},
            )

            citation_id = f"S{index}"

            citation = SourceCitation(
                citation_id=citation_id,
                document_id=metadata.get(
                    "document_id",
                    "",
                ),
                file_name=metadata.get(
                    "file_name",
                    "",
                ),
                title=metadata.get(
                    "title"
                ),
                page_number=metadata.get(
                    "page_number"
                ),
                section=metadata.get(
                    "section"
                ),
                source_name=metadata.get(
                    "source_name"
                ),
                source_url=metadata.get(
                    "source_url"
                ),
            )

            citations.append(citation)
            contexts.append(
                self._format_chunk(
                    citation,
                    result,
                )
            )

        return {
            "context": "\n\n".join(contexts),
            "citations": citations,
        }

    def _format_chunk(
        self,
        citation: SourceCitation,
        result: dict,
    ):
        page = (
            f"Page {citation.page_number}"
            if citation.page_number
            else "Page unknown"
        )

        section = (
            citation.section
            or "Unknown section"
        )

        return (
            f"[{citation.citation_id}] "
            f"{citation.title or citation.file_name}\n"
            f"Source: {citation.source_name or 'Unknown'}\n"
            f"{page}\n"
            f"Section: {section}\n\n"
            f"{result.get('content', '')}"
        )
