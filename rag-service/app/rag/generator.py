import json
import logging
import re
from typing import Any

from app.llm.base import BaseLLM
from app.rag.citation_validator import CitationValidator
from app.rag.context_builder import ContextBuilder
from app.rag.hybrid_context_builder import HybridContextBuilder
from app.rag.models import (
    AgentActionPlan,
    AgentActionType,
    CreateTripPayload,
    AddTripItemPayload,
    FavoriteEntityPayload,
    UserPersonalizationContext,
)
from app.rag.prompt import build_prompt

logger = logging.getLogger(__name__)

ACTION_REGEX = re.compile(r"<agent_action>([\s\S]*?)</agent_action>", re.IGNORECASE)


class RAGGenerator:

    def __init__(
        self,
        llm: BaseLLM,
        context_builder: ContextBuilder | HybridContextBuilder | None = None,
        citation_validator: CitationValidator | None = None,
    ):
        self.llm = llm
        self.context_builder = context_builder or HybridContextBuilder()
        self.citation_validator = citation_validator or CitationValidator()

    async def generate(
        self,
        query: str,
        retrieval_results: list[dict[str, Any]],
        db_results: list[dict[str, Any]] | None = None,
        user_context: UserPersonalizationContext | dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if not retrieval_results and not db_results and not user_context:
            return {
                "answer": (
                    "I don't have enough information in the available "
                    "Sri Lanka tourism database or document sources to answer your question."
                ),
                "status": "insufficient_context",
                "citations": [],
                "citation_validation": {
                    "valid": True,
                    "found": [],
                    "invalid": [],
                },
                "action_plan": None,
            }

        if isinstance(self.context_builder, HybridContextBuilder):
            context_data = self.context_builder.build(
                doc_results=retrieval_results or [],
                db_results=db_results or [],
                user_context=user_context,
            )
        else:
            context_data = self.context_builder.build(retrieval_results or [])

        prompt = build_prompt(
            query=query,
            context=context_data["context"],
        )

        try:
            raw_answer = await self.llm.generate(prompt)
        except Exception as e:
            return {
                "answer": (
                    "An error occurred while generating the answer. "
                    f"Details: {str(e)}"
                ),
                "status": "generation_error",
                "citations": [],
                "citation_validation": {
                    "valid": False,
                    "found": [],
                    "invalid": [],
                },
                "action_plan": None,
            }

        # 1. Parse and extract <agent_action> if present
        clean_answer = raw_answer
        action_plan_dict = None

        match = ACTION_REGEX.search(raw_answer)
        if match:
            raw_action_json = match.group(1).strip()
            # Remove the <agent_action> tag from the user-visible answer text
            clean_answer = ACTION_REGEX.sub("", raw_answer).strip()
            try:
                parsed_json = json.loads(raw_action_json)
                action_plan_dict = self._build_action_plan(parsed_json)
            except Exception as exc:
                logger.warning(f"Failed to parse agent_action JSON: {exc}")
                action_plan_dict = None

        # 2. Robust Fallback: If no <agent_action> JSON was provided, but answer contains a multi-day plan
        if not action_plan_dict and ("day 1" in clean_answer.lower() or "day 2" in clean_answer.lower()):
            action_plan_dict = self._extract_itinerary_from_text(clean_answer, query)

        raw_citations = context_data["citations"]
        citations_list = []
        for cit in raw_citations:
            if hasattr(cit, "model_dump"):
                citations_list.append(cit.model_dump())
            else:
                citations_list.append(cit)

        validation = self.citation_validator.validate(
            clean_answer,
            citations_list,
        )

        lower_answer = clean_answer.lower()
        if (
            "do not provide enough information" in lower_answer
            or "does not contain enough information" in lower_answer
            or "insufficient information" in lower_answer
        ):
            status = "insufficient_context"
        else:
            status = "grounded"

        return {
            "answer": clean_answer,
            "status": status,
            "citations": citations_list,
            "citation_validation": validation,
            "action_plan": action_plan_dict,
        }

    def _build_action_plan(self, data: dict[str, Any]) -> dict[str, Any]:
        action_type_str = (data.get("action_type") or "").upper()
        
        plan = AgentActionPlan(
            has_action=True,
            summary=data.get("summary") or data.get("title") or "Proposed Travel Action",
        )

        if action_type_str == AgentActionType.CREATE_TRIP.value:
            plan.action_type = AgentActionType.CREATE_TRIP
            plan.trip_proposal = CreateTripPayload.model_validate(data)
        elif action_type_str == AgentActionType.ADD_TRIP_ITEM.value:
            plan.action_type = AgentActionType.ADD_TRIP_ITEM
            plan.add_item_proposal = AddTripItemPayload.model_validate(data)
        elif action_type_str == AgentActionType.FAVORITE_ENTITY.value:
            plan.action_type = AgentActionType.FAVORITE_ENTITY
            plan.favorite_proposal = FavoriteEntityPayload.model_validate(data)

        return plan.model_dump(exclude_none=True)

    def _extract_itinerary_from_text(self, text: str, query: str) -> dict[str, Any] | None:
        """Fallback extractor that parses day-by-day itineraries directly from generated markdown."""
        day_pattern = re.compile(r"(?:###?\s*|\*\*|\b)?Day\s*(\d+)[:\s\-]+([^\n\r*]+)", re.IGNORECASE)
        matches = list(day_pattern.finditer(text))
        if not matches:
            return None

        days = []
        for i, match in enumerate(matches):
            try:
                day_num = int(match.group(1))
            except ValueError:
                day_num = i + 1

            day_title = match.group(2).strip().strip("*#_:")
            if not day_title:
                day_title = f"Day {day_num}"

            start_idx = match.end()
            end_idx = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            day_content = text[start_idx:end_idx]

            items = []
            item_lines = re.findall(r"(?:[-*•]|\b(?:Morning|Afternoon|Evening)[:\s])\s*([^\n\r]+)", day_content, re.IGNORECASE)
            for itm in item_lines:
                clean_itm = itm.strip().strip("*_")
                if len(clean_itm) > 3 and not clean_itm.lower().startswith("day"):
                    clean_title = re.sub(r"\[(S\d+|DB\d+|USER_[A-Z0-9_]+)\]", "", clean_itm).strip()
                    items.append({
                        "title": clean_title[:100],
                        "notes": clean_itm,
                        "entity_type": "ACTIVITY",
                    })

            if not items:
                items.append({
                    "title": day_title,
                    "entity_type": "ACTIVITY",
                })

            days.append({
                "day_number": day_num,
                "title": day_title,
                "items": items,
            })

        if not days:
            return None

        # Extract destination keywords
        dest = "Sri Lanka"
        lower_q = query.lower()
        if "galle" in lower_q and "mirissa" in lower_q:
            dest = "Galle & Mirissa"
        elif "galle" in lower_q:
            dest = "Galle"
        elif "mirissa" in lower_q:
            dest = "Mirissa"
        elif "ella" in lower_q:
            dest = "Ella"
        elif "kandy" in lower_q:
            dest = "Kandy"
        elif "sigiriya" in lower_q:
            dest = "Sigiriya"

        trip_title = f"{len(days)}-Day Itinerary in {dest}"
        first_line = text.strip().split("\n")[0].strip().strip("#*_")
        if first_line and len(first_line) < 70 and not first_line.lower().startswith("to plan"):
            trip_title = first_line

        return {
            "has_action": True,
            "action_type": "CREATE_TRIP",
            "summary": trip_title,
            "trip_proposal": {
                "title": trip_title,
                "destination": dest,
                "description": f"Proposed {len(days)}-day itinerary in {dest}.",
                "days": days,
            },
        }
