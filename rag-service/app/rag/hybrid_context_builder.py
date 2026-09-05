from typing import Any

from app.rag.context_builder import ContextBuilder
from app.rag.models import SourceCitation, UserPersonalizationContext


class HybridContextBuilder:
    """Formats context from unstructured document chunks (vector/BM25),
    live PostgreSQL database records, and authenticated user personalization context.
    """

    def __init__(self, doc_context_builder: ContextBuilder | None = None):
        self.doc_builder = doc_context_builder or ContextBuilder()

    def build(
        self,
        doc_results: list[dict[str, Any]],
        db_results: list[dict[str, Any]] | None = None,
        user_context: UserPersonalizationContext | dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        combined_contexts: list[str] = []
        all_citations: list[dict[str, Any]] = []

        # 1. Format User Personalization Context (Profile, Preferences, Trips, Favorites)
        if user_context:
            user_ctx_obj = (
                user_context
                if isinstance(user_context, UserPersonalizationContext)
                else UserPersonalizationContext.model_validate(user_context)
            )
            user_lines = self._format_user_context(user_ctx_obj, all_citations)
            if user_lines:
                combined_contexts.append(
                    "=== USER PROFILE & PERSONALIZATION CONTEXT [USER] ===\n" + "\n".join(user_lines)
                )

        # 2. Format Live Database Context
        if db_results:
            db_context_lines: list[str] = ["=== LIVE PLATFORM DATABASE RECORDS ==="]
            for idx, item in enumerate(db_results, start=1):
                citation_id = f"DB{idx}"
                meta = item.get("metadata", {})
                entity_type = meta.get("entity_type", "Database Record")
                title = meta.get("title") or "Entity"

                db_context_lines.append(f"[{citation_id}] [{entity_type}] {title}\n{item.get('content', '')}")

                all_citations.append(
                    {
                        "citation_id": citation_id,
                        "source_type": "database",
                        "entity_type": entity_type,
                        "title": title,
                        "slug": meta.get("slug", ""),
                        "category": meta.get("category", ""),
                        "region": meta.get("region", ""),
                    }
                )

            combined_contexts.append("\n\n".join(db_context_lines))

        # 3. Format Document Context
        if doc_results:
            doc_data = self.doc_builder.build(doc_results)
            if doc_data.get("context"):
                combined_contexts.append("=== TOURISM KNOWLEDGE DOCUMENTS ===\n" + doc_data["context"])

            for citation in doc_data.get("citations", []):
                if isinstance(citation, SourceCitation):
                    dumped = citation.model_dump()
                    dumped["source_type"] = "document"
                    all_citations.append(dumped)
                elif isinstance(citation, dict):
                    citation["source_type"] = "document"
                    all_citations.append(citation)

        return {
            "context": "\n\n".join(combined_contexts),
            "citations": all_citations,
        }

    def _format_user_context(
        self,
        user_ctx: UserPersonalizationContext,
        citations: list[dict[str, Any]],
    ) -> list[str]:
        lines: list[str] = []

        # Profile & Preferences
        if user_ctx.profile:
            p = user_ctx.profile
            name = p.display_name or p.first_name or "Traveler"
            profile_parts = [f"Name: {name}"]
            if p.country_code:
                profile_parts.append(f"Origin Country: {p.country_code}")
            if p.preferred_language and p.preferred_language != "en":
                profile_parts.append(f"Language: {p.preferred_language}")
            if p.travel_styles:
                profile_parts.append(f"Travel Styles: {', '.join(p.travel_styles)}")
            if p.dietary_preferences:
                profile_parts.append(f"Dietary Preferences: {', '.join(p.dietary_preferences)}")
            if p.bio:
                profile_parts.append(f"Bio / Notes: {p.bio}")

            lines.append(f"[USER_PROFILE] Profile & Preferences: {' | '.join(profile_parts)}")
            citations.append(
                {
                    "citation_id": "USER_PROFILE",
                    "source_type": "user_profile",
                    "title": f"User Profile ({name})",
                }
            )

        # Saved Favorites
        if user_ctx.favorites:
            lines.append("\n[USER_FAVORITES] Saved Wishlist & Favorite Places:")
            for idx, fav in enumerate(user_ctx.favorites, start=1):
                cit_id = f"USER_FAV{idx}"
                loc_info = f" ({fav.region})" if fav.region else ""
                cat_info = f" - {fav.category}" if fav.category else ""
                lines.append(f"  • [{cit_id}] [{fav.entity_type}] {fav.title}{loc_info}{cat_info}")
                citations.append(
                    {
                        "citation_id": cit_id,
                        "source_type": "user_favorite",
                        "entity_type": fav.entity_type,
                        "title": fav.title,
                        "region": fav.region or "",
                        "category": fav.category or "",
                        "slug": fav.slug or "",
                    }
                )

        # Saved Trips & Itineraries
        if user_ctx.saved_trips:
            lines.append("\n[USER_TRIPS] Planned Trips & Itineraries:")
            for idx, trip in enumerate(user_ctx.saved_trips, start=1):
                cit_id = f"USER_TRIP{idx}"
                date_info = f" ({trip.start_date} to {trip.end_date})" if trip.start_date else ""
                lines.append(f"  • [{cit_id}] Trip: \"{trip.title}\"{date_info} [Status: {trip.status}]")
                if trip.description:
                    lines.append(f"    Description: {trip.description}")
                for day in trip.days:
                    day_title = f": {day.title}" if day.title else ""
                    lines.append(f"    - Day {day.day_number}{day_title}")
                    for itm in day.items:
                        time_str = f" at {itm.start_time}" if itm.start_time else ""
                        lines.append(f"      * {itm.title}{time_str}")

                citations.append(
                    {
                        "citation_id": cit_id,
                        "source_type": "user_trip",
                        "title": trip.title,
                    }
                )

        return lines
