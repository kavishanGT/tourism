import pytest
from app.rag.citation_validator import CitationValidator
from app.rag.hybrid_context_builder import HybridContextBuilder
from app.rag.models import (
    UserFavoriteItem,
    UserPersonalizationContext,
    UserProfileContext,
    UserSavedTrip,
    UserTripDay,
    UserTripDayItem,
)
from app.rag.query_router import QueryIntent, QueryRouter


def test_personalized_query_routing():
    router = QueryRouter()

    res = router.route("Recommend some places based on my saved favorites")
    assert res.intent == QueryIntent.PERSONALIZED
    assert res.retrieval_strategy == "hybrid_db"

    res_trip = router.route("What should I do next in my upcoming trip?")
    assert res_trip.intent == QueryIntent.PERSONALIZED

    res_style = router.route("Find activities that fit my travel style", has_user_context=True)
    assert res_style.intent == QueryIntent.PERSONALIZED


def test_hybrid_context_builder_with_user_context():
    builder = HybridContextBuilder()

    user_ctx = UserPersonalizationContext(
        profile=UserProfileContext(
            display_name="Sarah",
            country_code="GB",
            preferred_language="en",
            travel_styles=["Adventure", "Surfing"],
            dietary_preferences=["Vegetarian"],
        ),
        favorites=[
            UserFavoriteItem(
                entity_type="ATTRACTION",
                entity_id="11111111-1111-1111-1111-111111111111",
                title="Mirissa Beach",
                region="Southern",
                category="Beaches",
                slug="mirissa-beach",
            )
        ],
        saved_trips=[
            UserSavedTrip(
                trip_id="22222222-2222-2222-2222-222222222222",
                title="Southern Surf & Heritage",
                start_date="2026-09-10",
                end_date="2026-09-15",
                days=[
                    UserTripDay(
                        day_number=1,
                        title="Arrival in Galle",
                        items=[
                            UserTripDayItem(title="Explore Galle Fort", start_time="10:00")
                        ],
                    )
                ],
            )
        ],
    )

    db_results = [
        {
            "content": "Weligama Bay is Sri Lanka's top surfing school destination.",
            "metadata": {
                "entity_type": "ATTRACTION",
                "title": "Weligama Bay",
                "region": "Southern",
                "slug": "weligama-bay",
            },
        }
    ]

    built = builder.build(doc_results=[], db_results=db_results, user_context=user_ctx)
    ctx = built["context"]

    assert "=== USER PROFILE & PERSONALIZATION CONTEXT [USER] ===" in ctx
    assert "Sarah" in ctx
    assert "Adventure" in ctx
    assert "Vegetarian" in ctx
    assert "[USER_FAV1]" in ctx
    assert "Mirissa Beach" in ctx
    assert "[USER_TRIP1]" in ctx
    assert "Southern Surf & Heritage" in ctx
    assert "[DB1]" in ctx
    assert "Weligama Bay" in ctx

    citation_ids = [c["citation_id"] for c in built["citations"]]
    assert "USER_PROFILE" in citation_ids
    assert "USER_FAV1" in citation_ids
    assert "USER_TRIP1" in citation_ids
    assert "DB1" in citation_ids


def test_citation_validator_user_citations():
    validator = CitationValidator()
    citations = [
        {"citation_id": "USER_PROFILE"},
        {"citation_id": "USER_FAV1"},
        {"citation_id": "USER_TRIP1"},
        {"citation_id": "DB1"},
    ]

    valid_answer = (
        "Hello Sarah [USER_PROFILE], based on your planned trip [USER_TRIP1] "
        "and favorite spot Mirissa [USER_FAV1], you will love Weligama Bay [DB1]."
    )
    res = validator.validate(valid_answer, citations)
    assert res["valid"] is True
    assert set(res["found"]) == {"USER_PROFILE", "USER_TRIP1", "USER_FAV1", "DB1"}
    assert res["invalid"] == []
