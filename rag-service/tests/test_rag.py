import pytest
from app.llm.base import BaseLLM
from app.rag.citation_validator import CitationValidator
from app.rag.context_builder import ContextBuilder
from app.rag.generator import RAGGenerator
from app.rag.models import SourceCitation


class MockLLM(BaseLLM):

    def __init__(self, response_text: str):
        self.response_text = response_text

    async def generate(self, prompt: str) -> str:
        return self.response_text


def test_context_builder():
    builder = ContextBuilder()
    results = [
        {
            "content": "Ella is famous for Nine Arch Bridge and Ella Rock.",
            "metadata": {
                "document_id": "doc_123",
                "file_name": "ELLA_VOLUME_1_Part_A.pdf",
                "page_number": 23,
                "section": "Attractions",
                "source_name": "SLTDA",
            },
        }
    ]

    built = builder.build(results)
    assert "[S1]" in built["context"]
    assert "Page 23" in built["context"]
    assert len(built["citations"]) == 1
    assert isinstance(built["citations"][0], SourceCitation)
    assert built["citations"][0].citation_id == "S1"


def test_citation_validator_valid():
    validator = CitationValidator()
    citations = [{"citation_id": "S1"}, {"citation_id": "S2"}]
    answer = "Ella features Nine Arch Bridge [S1] and Little Adam's Peak [S2]."

    val = validator.validate(answer, citations)
    assert val["valid"] is True
    assert val["found"] == ["S1", "S2"]
    assert val["invalid"] == []


def test_citation_validator_invalid():
    validator = CitationValidator()
    citations = [{"citation_id": "S1"}]
    answer = "Ella is located in Uva province [S1][S99]."

    val = validator.validate(answer, citations)
    assert val["valid"] is False
    assert val["found"] == ["S1", "S99"]
    assert val["invalid"] == ["S99"]


@pytest.mark.asyncio
async def test_rag_generator_grounded():
    llm = MockLLM("Ella is located in Uva province [S1].")
    builder = ContextBuilder()
    generator = RAGGenerator(llm=llm, context_builder=builder)

    results = [
        {
            "content": "Ella is located in Uva province.",
            "metadata": {
                "document_id": "doc_123",
                "file_name": "Ella_Master_Plan.pdf",
                "page_number": 5,
            },
        }
    ]

    res = await generator.generate("Where is Ella?", results)
    assert res["status"] == "grounded"
    assert "Ella is located" in res["answer"]
    assert len(res["citations"]) == 1
    assert res["citation_validation"]["valid"] is True


@pytest.mark.asyncio
async def test_rag_generator_insufficient_context():
    llm = MockLLM("Test")
    builder = ContextBuilder()
    generator = RAGGenerator(llm=llm, context_builder=builder)

    res = await generator.generate("What is the current weather in Ella?", [])
    assert res["status"] == "insufficient_context"
    assert "don't have enough information" in res["answer"].lower()
    assert res["citations"] == []
