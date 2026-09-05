import asyncio
import logging
import re
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

STOP_WORDS = {
    "what", "when", "where", "which", "who", "whom", "this", "that", "these", "those",
    "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or",
    "because", "as", "until", "while", "of", "at", "by", "for", "with", "about",
    "against", "between", "into", "through", "during", "before", "after", "above",
    "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
    "again", "further", "then", "once", "here", "there", "all", "any", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
    "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will",
    "just", "don", "should", "now", "recommend", "show", "tell", "give", "top", "best",
    "popular", "good", "great", "find", "list", "places", "sri", "lanka"
}


class StructuredDBRetriever:
    """Retriever that fetches live structured domain data (destinations,
    attractions, experiences, providers) from the Spring Boot API.
    """

    def __init__(self, base_url: str | None = None, timeout: float = 3.0):
        self.base_url = (base_url or settings.spring_boot_base_url).rstrip("/")
        self.timeout = timeout

    async def _fetch_term(self, client: httpx.AsyncClient, term: str) -> dict[str, Any]:
        try:
            search_url = f"{self.base_url}/api/v1/search?q={quote(term)}"
            response = await client.get(search_url)
            if response.status_code == 200:
                return response.json().get("data") or {}
        except Exception as exc:
            logger.warning(f"DB search query failed for term '{term}': {exc}")
        return {}

    async def retrieve(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        """Query the Spring Boot unified search endpoint concurrently and convert results
        into structured context items.
        """
        if not query or len(query.strip()) < 2:
            return []

        search_terms = self._extract_search_terms(query)[:3]
        results: list[dict[str, Any]] = []
        seen_titles = set()

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            tasks = [self._fetch_term(client, term) for term in search_terms]
            payloads = await asyncio.gather(*tasks, return_exceptions=True)

            for data in payloads:
                if not isinstance(data, dict):
                    continue

                for dest in (data.get("destinations") or []):
                    name = dest.get("name") or dest.get("title")
                    if name and name not in seen_titles:
                        seen_titles.add(name)
                        results.append(self._format_destination(dest))

                for attr in (data.get("attractions") or []):
                    name = attr.get("name") or attr.get("title")
                    if name and name not in seen_titles:
                        seen_titles.add(name)
                        results.append(self._format_attraction(attr))

                for exp in (data.get("experiences") or []):
                    title = exp.get("title") or exp.get("name")
                    if title and title not in seen_titles:
                        seen_titles.add(title)
                        results.append(self._format_experience(exp))

                for acc in (data.get("accommodations") or []):
                    name = acc.get("name") or acc.get("businessName")
                    if name and name not in seen_titles:
                        seen_titles.add(name)
                        results.append(self._format_provider(acc, "Accommodation"))

                for rest in (data.get("restaurants") or []):
                    name = rest.get("name") or rest.get("businessName")
                    if name and name not in seen_titles:
                        seen_titles.add(name)
                        results.append(self._format_provider(rest, "Restaurant"))

        return results[:limit]

    def _extract_search_terms(self, query: str) -> list[str]:
        words = re.findall(r"\b[A-Za-z0-9_-]+\b", query)
        filtered = [w for w in words if w.lower() not in STOP_WORDS and len(w) > 2]
        
        terms = []
        # Add filtered keywords
        terms.extend(filtered[:3])
        # Add full query as fallback if short
        if len(query.split()) <= 3 and query.strip() not in terms:
            terms.insert(0, query.strip())
        
        return terms if terms else [query.strip()]

    def _format_destination(self, dest: dict) -> dict[str, Any]:
        name = dest.get("name") or dest.get("title") or "Destination"
        region = dest.get("regionName") or dest.get("region") or ""
        desc = dest.get("shortDescription") or dest.get("description") or ""
        slug = dest.get("slug") or ""

        content_parts = [f"Destination: {name}"]
        if region:
            content_parts.append(f"Region: {region}")
        if desc:
            content_parts.append(f"Description: {desc}")

        return {
            "content": "\n".join(content_parts),
            "score": 1.0,
            "metadata": {
                "source_type": "database",
                "entity_type": "Destination",
                "title": name,
                "slug": slug,
                "region": region,
            },
        }

    def _format_attraction(self, attr: dict) -> dict[str, Any]:
        name = attr.get("name") or attr.get("title") or "Attraction"
        category = attr.get("categoryName") or attr.get("category") or ""
        fee = attr.get("priceFrom") or attr.get("entryFee") or ""
        currency = attr.get("currency") or "USD"
        dest_name = attr.get("destinationName") or ""
        desc = attr.get("shortDescription") or attr.get("description") or ""
        slug = attr.get("slug") or ""

        content_parts = [f"Attraction: {name}"]
        if dest_name:
            content_parts.append(f"Location: {dest_name}")
        if category:
            content_parts.append(f"Category: {category}")
        if fee != "":
            content_parts.append(f"Price: {currency} {fee}")
        if desc:
            content_parts.append(f"Description: {desc}")

        return {
            "content": "\n".join(content_parts),
            "score": 1.0,
            "metadata": {
                "source_type": "database",
                "entity_type": "Attraction",
                "title": name,
                "slug": slug,
                "category": category,
                "price": fee,
            },
        }

    def _format_experience(self, exp: dict) -> dict[str, Any]:
        title = exp.get("name") or exp.get("title") or "Experience"
        category = exp.get("categoryName") or exp.get("category") or ""
        price = exp.get("priceFrom") or exp.get("price") or ""
        currency = exp.get("currency") or "USD"
        duration = exp.get("durationMinutes") or exp.get("duration") or ""
        desc = exp.get("shortDescription") or exp.get("description") or ""
        slug = exp.get("slug") or ""

        content_parts = [f"Experience: {title}"]
        if category:
            content_parts.append(f"Category: {category}")
        if price != "":
            content_parts.append(f"Price: {currency} {price}")
        if duration:
            content_parts.append(f"Duration: {duration} mins" if isinstance(duration, (int, float)) else f"Duration: {duration}")
        if desc:
            content_parts.append(f"Description: {desc}")

        return {
            "content": "\n".join(content_parts),
            "score": 1.0,
            "metadata": {
                "source_type": "database",
                "entity_type": "Experience",
                "title": title,
                "slug": slug,
                "price": price,
                "duration": duration,
            },
        }

    def _format_provider(self, prov: dict, entity_type: str) -> dict[str, Any]:
        name = prov.get("name") or prov.get("businessName") or entity_type
        desc = prov.get("description") or ""

        content_parts = [f"{entity_type}: {name}"]
        if desc:
            content_parts.append(f"Description: {desc}")

        return {
            "content": "\n".join(content_parts),
            "score": 1.0,
            "metadata": {
                "source_type": "database",
                "entity_type": entity_type,
                "title": name,
            },
        }
