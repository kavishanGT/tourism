from dataclasses import dataclass, field
from typing import Any


@dataclass
class DocumentPage:
    page_number: int
    text: str
    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class Document:
    document_id: str
    content: str
    metadata: dict[str, Any] = field(
        default_factory=dict
    )
    pages: list[DocumentPage] = field(
        default_factory=list
    )


@dataclass
class DocumentChunk:
    chunk_id: str
    content: str
    metadata: dict[str, Any] = field(
        default_factory=dict
    )