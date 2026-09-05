import pytest
from app.llm.base import BaseLLM
from app.rag.generator import RAGGenerator
from app.rag.models import AgentActionType
from app.rag.query_router import QueryIntent, QueryRouter


class MockAgentLLM(BaseLLM):

    def __init__(self, response_text: str):
        self.response_text = response_text

    async def generate(self, prompt: str) -> str:
        return self.response_text


def test_itinerary_query_routing():
    router = QueryRouter()

    res = router.route("Plan a 3-day beach and heritage trip to Galle and Mirissa")
    assert res.intent == QueryIntent.ITINERARY_PLANNING

    res2 = router.route("Create a 2-day itinerary for Ella tea country")
    assert res2.intent == QueryIntent.ITINERARY_PLANNING

    res3 = router.route("Build an itinerary for my vacation")
    assert res3.intent == QueryIntent.ITINERARY_PLANNING


@pytest.mark.asyncio
async def test_action_plan_parsing():
    raw_llm_response = """
Here is your proposed 2-Day Southern Coast Itinerary:

* **Day 1: Galle Fort & Coastal Heritage** [DB1]
  * Morning walking tour around the 17th-century ramparts.
* **Day 2: Mirissa Beach & Whale Watching** [DB2]
  * Early morning boat safari and sunset at Coconut Tree Hill.

<agent_action>
{
  "action_type": "CREATE_TRIP",
  "title": "2-Day Southern Coast Highlights",
  "description": "Exploration of Galle Fort and Mirissa whale watching.",
  "destination": "Southern Province",
  "days": [
    {
      "day_number": 1,
      "title": "Galle Heritage",
      "items": [
        {
          "title": "Walking Tour of Galle Fort",
          "start_time": "09:00",
          "end_time": "12:00",
          "notes": "Explore Dutch architecture",
          "entity_type": "ATTRACTION"
        }
      ]
    },
    {
      "day_number": 2,
      "title": "Mirissa Coast",
      "items": [
        {
          "title": "Whale Watching Boat Safari",
          "start_time": "06:30",
          "end_time": "11:30",
          "notes": "Departs from Mirissa harbor",
          "entity_type": "EXPERIENCE"
        }
      ]
    }
  ]
}
</agent_action>
"""
    llm = MockAgentLLM(raw_llm_response)
    generator = RAGGenerator(llm=llm)

    results = [
        {
            "content": "Galle Fort is a historic Portuguese and Dutch fortification.",
            "metadata": {"title": "Galle Fort", "entity_type": "ATTRACTION", "source_type": "database"},
        },
        {
            "content": "Mirissa is a popular beach town for whale watching.",
            "metadata": {"title": "Mirissa Whale Watching", "entity_type": "EXPERIENCE", "source_type": "database"},
        },
    ]

    res = await generator.generate("Plan a 2-day trip to Galle and Mirissa", results)
    
    assert "<agent_action>" not in res["answer"]
    assert "Here is your proposed 2-Day Southern Coast Itinerary" in res["answer"]

    action_plan = res["action_plan"]
    assert action_plan is not None
    assert action_plan["has_action"] is True
    assert action_plan["action_type"] == AgentActionType.CREATE_TRIP.value
    assert action_plan["trip_proposal"]["title"] == "2-Day Southern Coast Highlights"
    assert len(action_plan["trip_proposal"]["days"]) == 2


@pytest.mark.asyncio
async def test_fallback_itinerary_extraction_from_markdown():
    # User's exact prompt response without <agent_action> XML
    markdown_response = """
3-Day Beach and Heritage Trip to Galle and Mirissa

To plan a memorable 3-day beach and heritage trip to Galle and Mirissa, we'll focus on combining coastal beauty with cultural heritage.

Day 1: Arrival in Galle & Historic Fort
Morning: Arrive in Galle and check into your hotel.
Afternoon: Visit the Galle Fort [S1], a UNESCO World Heritage Site.
Evening: Enjoy the sunset at the Galle Fort ramparts.

Day 2: Mirissa Beach and Whale Watching
Morning: Drive to Mirissa and spend the day relaxing on Mirissa Beach.
Afternoon: Optional whale watching tour [S2].
Evening: Return to Galle and enjoy dinner.

Day 3: Cultural Experiences in Galle
Morning: Visit the Galle National Museum.
Afternoon: Explore the Galle Market.
Evening: Departure from Galle.
"""
    llm = MockAgentLLM(markdown_response)
    generator = RAGGenerator(llm=llm)

    results = [
        {
            "content": "Tourism Master Plan",
            "metadata": {"title": "Tourism Plan", "entity_type": "DOCUMENT", "source_type": "document"},
        }
    ]

    res = await generator.generate("Plan a 3-day beach and heritage trip to Galle and Mirissa", results)

    action_plan = res["action_plan"]
    assert action_plan is not None
    assert action_plan["has_action"] is True
    assert action_plan["action_type"] == AgentActionType.CREATE_TRIP.value
    assert "Galle & Mirissa" in action_plan["trip_proposal"]["destination"]
    assert len(action_plan["trip_proposal"]["days"]) == 3
    assert action_plan["trip_proposal"]["days"][0]["title"] == "Arrival in Galle & Historic Fort"
    assert len(action_plan["trip_proposal"]["days"][0]["items"]) == 3
