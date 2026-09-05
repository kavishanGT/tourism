import re
from dataclasses import dataclass, field
from enum import Enum


class QueryIntent(str, Enum):
    STRUCTURED_DB = "structured_db"
    DOCUMENT_RAG = "document_rag"
    HYBRID = "hybrid"
    CONVERSATIONAL = "conversational"
    PERSONALIZED = "personalized"
    ITINERARY_PLANNING = "itinerary_planning"


@dataclass
class RouteDecision:
    intent: QueryIntent
    retrieval_strategy: str
    confidence: float
    extracted_keywords: list[str] = field(default_factory=list)
    reasoning: str = ""


class QueryRouter:
    """Classifies user queries to determine the optimal retrieval strategy
    combining vector search, BM25 keyword search, live PostgreSQL DB records,
    user personalization context, and dynamic itinerary planning.
    """

    ITINERARY_PATTERNS = [
        r"\b(create|plan|generate|build|make|design|draft|suggest|organize)\b.*?\b(itinerar(?:y|ies)|trip|vacation|tour|holiday|travel\s*plan)\b",
        r"\b\d+[- ](?:day|days)\b.*?\b(itinerar(?:y|ies)|trip|plan|tour|vacation)\b",
        r"\b(weekend|week[- ]long)\b.*?\b(itinerar(?:y|ies)|trip|plan|tour)\b",
        r"\b(itinerary\s+for|trip\s+plan\s+for|plan\s+my\s+trip|plan\s+a\s+trip|daily\s+plan)\b",
        r"\b(add\s+.*to\s+my\s+trip|add\s+to\s+my\s+itinerary|add\s+to\s+trip)\b",
    ]

    PERSONALIZED_PATTERNS = [
        r"\b(my\s*(favorites?|wishlist|trips?|itinerar(?:y|ies)|plans?|profile|preferences?|style|saved))\b",
        r"\b(based\s*on\s*my|for\s*me|tailor\s*for\s*me|personalized?|recommend\s*for\s*me|suggest\s*for\s*me)\b",
        r"\b(what\s*should\s*i\s*do\s*next|fit\s*my\s*trip|match\s*my\s*schedule|what\s*fits\s*my)\b",
        r"\b(where\s*should\s*i\s*go\s*next|in\s*my\s*upcoming\s*trip)\b",
    ]

    DB_PATTERNS = [
        r"\b(price|fee|cost|ticket|entry|opening\s*hours?|timing|open|close)\b",
        r"\b(hotel|resort|accommodation|stay|place\s*to\s*stay|room)\b",
        r"\b(restaurant|food|dining|eat|cafe)\b",
        r"\b(attraction|destination|experience|tour|activity|activities|spot|places\s*to\s*visit)\b",
        r"\b(in|near|at|around)\s+([A-Z][a-z]+|[a-z]+)\b",
    ]

    DOC_PATTERNS = [
        r"\b(law|regulation|policy|act|strategy|master\s*plan|government|official|council)\b",
        r"\b(history|historical|heritage|culture|background|origin|century|ancient)\b",
        r"\b(visa|passport|customs|requirement|guideline|rule|safety)\b",
        r"\b(document|pdf|source|report|section|chapter)\b",
    ]

    GREETING_PATTERNS = [
        r"^\s*(hello|hi|hey|greetings|good\s*(morning|afternoon|evening))(\s+\w+){0,3}\s*[\.!\?]?\s*$",
        r"^\s*(who\s*are\s*you|what\s*can\s*you\s*do|help|how\s*are\s*you)\s*[\.!\?]?\s*$",
    ]

    def route(self, query: str, has_user_context: bool = False) -> RouteDecision:
        q = query.strip()
        lower_q = q.lower()

        # Check conversational intent
        for pat in self.GREETING_PATTERNS:
            if re.search(pat, lower_q):
                return RouteDecision(
                    intent=QueryIntent.CONVERSATIONAL,
                    retrieval_strategy="none",
                    confidence=0.95,
                    reasoning="Query matches greeting pattern.",
                )

        # Check itinerary planning & travel agent action intent (evaluated first to prioritize actionable itinerary generation)
        itinerary_matches = sum(1 for pat in self.ITINERARY_PATTERNS if re.search(pat, lower_q))
        if itinerary_matches > 0:
            words = [w for w in re.findall(r"\w+", q) if len(w) > 3]
            return RouteDecision(
                intent=QueryIntent.ITINERARY_PLANNING,
                retrieval_strategy="hybrid_db",
                confidence=0.95,
                extracted_keywords=words,
                reasoning="Query asks for multi-day itinerary generation or travel plan creation.",
            )

        # Check personalized intent
        personalized_matches = sum(1 for pat in self.PERSONALIZED_PATTERNS if re.search(pat, lower_q))
        if personalized_matches > 0 or (has_user_context and re.search(r"\b(i\s*like|i\s*love|my|me)\b", lower_q)):
            words = [w for w in re.findall(r"\w+", q) if len(w) > 3]
            return RouteDecision(
                intent=QueryIntent.PERSONALIZED,
                retrieval_strategy="hybrid_db",
                confidence=0.90,
                extracted_keywords=words,
                reasoning="Query requests personalized recommendations tailored to user profile, trips, or favorites.",
            )

        db_matches = sum(1 for pat in self.DB_PATTERNS if re.search(pat, lower_q))
        doc_matches = sum(1 for pat in self.DOC_PATTERNS if re.search(pat, lower_q))

        # Extract potential location/search keywords
        words = [w for w in re.findall(r"\w+", q) if len(w) > 3]

        if db_matches > 0 and doc_matches > 0:
            return RouteDecision(
                intent=QueryIntent.HYBRID,
                retrieval_strategy="hybrid_db",
                confidence=0.85,
                extracted_keywords=words,
                reasoning="Query contains signals for both live database entities and background documents.",
            )
        elif db_matches > doc_matches:
            return RouteDecision(
                intent=QueryIntent.STRUCTURED_DB,
                retrieval_strategy="hybrid_db",
                confidence=0.80,
                extracted_keywords=words,
                reasoning="Query emphasizes specific entity details (prices, locations, attractions).",
            )
        elif doc_matches > 0:
            return RouteDecision(
                intent=QueryIntent.DOCUMENT_RAG,
                retrieval_strategy="hybrid_rerank",
                confidence=0.80,
                extracted_keywords=words,
                reasoning="Query emphasizes historical, policy, or document knowledge.",
            )
        else:
            # Default fallback for general queries is hybrid_db to ensure both DB & Doc context are checked
            return RouteDecision(
                intent=QueryIntent.HYBRID,
                retrieval_strategy="hybrid_db",
                confidence=0.60,
                extracted_keywords=words,
                reasoning="Default route balancing live database records and document retrieval.",
            )
