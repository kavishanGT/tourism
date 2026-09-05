import pytest
from app.retrieval.db_retriever import StructuredDBRetriever


@pytest.mark.asyncio
async def test_db_retriever_offline_fallback():
    # Use invalid port to test offline fallback
    retriever = StructuredDBRetriever(base_url="http://localhost:59999", timeout=0.5)
    results = await retriever.retrieve("sigiriya")
    # Must return empty list without raising exception
    assert results == []


def test_db_retriever_formatting():
    retriever = StructuredDBRetriever()

    dest_item = retriever._format_destination({"name": "Ella", "regionName": "Central Highlands", "description": "Scenic town", "slug": "ella"})
    assert dest_item["metadata"]["entity_type"] == "Destination"
    assert "Destination: Ella" in dest_item["content"]

    attr_item = retriever._format_attraction({
        "name": "Sigiriya Fortress",
        "categoryName": "Historical",
        "entryFee": "$30",
        "openingHours": "06:30 - 17:30",
        "destinationName": "Matale",
        "slug": "sigiriya",
    })
    assert attr_item["metadata"]["entity_type"] == "Attraction"
    assert "Entry Fee: $30" in attr_item["content"]
    assert "Opening Hours: 06:30 - 17:30" in attr_item["content"]
