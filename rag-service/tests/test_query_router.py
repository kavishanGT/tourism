from app.rag.query_router import QueryIntent, QueryRouter


def test_query_router_intent_classification():
    router = QueryRouter()

    # Conversational
    greeting_res = router.route("Hello there!")
    assert greeting_res.intent == QueryIntent.CONVERSATIONAL
    assert greeting_res.retrieval_strategy == "none"

    # Structured DB (pricing / ticket details)
    db_res = router.route("What is the entry fee and opening hours for Sigiriya Rock?")
    assert db_res.intent in (QueryIntent.STRUCTURED_DB, QueryIntent.HYBRID)
    assert db_res.retrieval_strategy == "hybrid_db"

    # Document RAG (history / official regulation / policy)
    doc_res = router.route("What are the official national tourism regulations and heritage laws?")
    assert doc_res.intent == QueryIntent.DOCUMENT_RAG
    assert doc_res.retrieval_strategy == "hybrid_rerank"

    # Hybrid
    hybrid_res = router.route("What is the ticket price for Sigiriya and its history as an ancient fortress?")
    assert hybrid_res.intent == QueryIntent.HYBRID
    assert hybrid_res.retrieval_strategy == "hybrid_db"
