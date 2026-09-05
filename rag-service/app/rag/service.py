import logging
from typing import Any

from app.rag.generator import RAGGenerator
from app.rag.models import UserPersonalizationContext
from app.rag.query_router import QueryIntent, QueryRouter
from app.retrieval.db_retriever import StructuredDBRetriever

logger = logging.getLogger(__name__)


class RAGService:

    def __init__(
        self,
        dense_retriever,
        hybrid_retriever,
        hybrid_rerank_retriever,
        generator: RAGGenerator,
        db_retriever: StructuredDBRetriever | None = None,
        query_router: QueryRouter | None = None,
    ):
        self.dense_retriever = dense_retriever
        self.hybrid_retriever = hybrid_retriever
        self.hybrid_rerank_retriever = hybrid_rerank_retriever
        self.generator = generator
        self.db_retriever = db_retriever or StructuredDBRetriever()
        self.query_router = query_router or QueryRouter()

    async def answer(
        self,
        query: str,
        retrieval_mode: str = "auto",
        top_k: int = 5,
        candidate_k: int = 20,
        user_context: UserPersonalizationContext | dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        route_info = None

        # 1. Automatic Query Routing
        if retrieval_mode == "auto":
            has_user_context = user_context is not None
            decision = self.query_router.route(query, has_user_context=has_user_context)
            intent = decision.intent
            route_strategy = decision.retrieval_strategy
            route_info = {
                "intent": intent.value,
                "confidence": decision.confidence,
                "reasoning": decision.reasoning,
                "strategy": route_strategy,
            }

            if intent == QueryIntent.CONVERSATIONAL:
                return {
                    "query": query,
                    "answer": (
                        "Hello! I am your Sri Lanka Tourism AI Assistant. "
                        "I can help you explore destinations, attractions, experiences, pricing, opening hours, "
                        "and official travel guides tailored to your preferences. How can I assist your journey today?"
                    ),
                    "status": "conversational",
                    "citations": [],
                    "citation_validation": {"valid": True, "found": [], "invalid": []},
                    "retrieval": {
                        "mode": "auto",
                        "intent": intent.value,
                        "strategy": route_strategy,
                    },
                }

            # If the user asks for personal trip/favorites info but is not logged in or has no context
            if intent == QueryIntent.PERSONALIZED and not user_context:
                return {
                    "query": query,
                    "answer": (
                        "I'd love to tailor recommendations specifically for your journey! 🌟\n\n"
                        "To unlock personalized recommendations:\n"
                        "1. **Log in** to your account.\n"
                        "2. Create a trip under the **Trips** section or save places to your **Favorites** wishlist.\n\n"
                        "In the meantime, feel free to ask me for recommendations about any destination (e.g. *\"Top beach experiences in Southern Sri Lanka\"* or *\"What to do in Ella\"*)!"
                    ),
                    "status": "unauthenticated_personalization",
                    "citations": [],
                    "citation_validation": {"valid": True, "found": [], "invalid": []},
                    "retrieval": {
                        "mode": "auto",
                        "intent": intent.value,
                        "has_user_context": False,
                        "strategy": route_strategy,
                    },
                }

            chosen_mode = (
                "hybrid_db"
                if intent in (QueryIntent.STRUCTURED_DB, QueryIntent.HYBRID, QueryIntent.PERSONALIZED)
                else "hybrid_rerank"
            )
        else:
            chosen_mode = retrieval_mode

        # 2. Fetch Structured DB Records (Destinations, Attractions, Experiences)
        db_results = []
        if chosen_mode in ("auto", "hybrid_db") or (
            route_info and route_info.get("intent") in ("structured_db", "hybrid", "personalized")
        ):
            try:
                # Enhance DB query with user context keywords if personalized
                db_query = query
                if route_info and route_info.get("intent") == "personalized" and user_context:
                    fav_titles = []
                    if isinstance(user_context, UserPersonalizationContext):
                        fav_titles = [f.title for f in user_context.favorites[:3]]
                    elif isinstance(user_context, dict):
                        fav_titles = [f.get("title", "") for f in user_context.get("favorites", [])[:3]]
                    if fav_titles:
                        db_query = f"{query} {' '.join(fav_titles)}"

                db_results = await self.db_retriever.retrieve(query=db_query, limit=top_k)
            except Exception as e:
                logger.warning(f"Error fetching DB results: {e}")
                db_results = []

        # 3. Fetch Document Chunks (Vector / BM25 / Rerank)
        doc_results = []
        try:
            if chosen_mode == "hybrid" and self.hybrid_retriever:
                doc_results = self.hybrid_retriever.retrieve(
                    query=query,
                    top_k=top_k,
                    candidate_k=candidate_k,
                )
            elif (chosen_mode in ("hybrid_rerank", "hybrid_db") or chosen_mode == "auto") and self.hybrid_rerank_retriever:
                try:
                    doc_results = self.hybrid_rerank_retriever.retrieve(
                        query=query,
                        top_k=top_k,
                        candidate_k=candidate_k,
                    )
                except Exception:
                    if self.hybrid_retriever:
                        doc_results = self.hybrid_retriever.retrieve(
                            query=query,
                            top_k=top_k,
                            candidate_k=candidate_k,
                        )
                    else:
                        doc_results = self.dense_retriever.retrieve(
                            query=query,
                            top_k=top_k,
                        )
            else:
                doc_results = self.dense_retriever.retrieve(
                    query=query,
                    top_k=top_k,
                )
        except Exception as e:
            logger.warning(f"Error fetching document results: {e}")
            doc_results = []

        # 4. Generate Grounded Response using Hybrid Context (DB + Docs + User Context)
        generated = await self.generator.generate(
            query=query,
            retrieval_results=doc_results,
            db_results=db_results,
            user_context=user_context,
        )

        return {
            "query": query,
            "answer": generated["answer"],
            "status": generated.get("status", "grounded"),
            "citations": generated["citations"],
            "citation_validation": generated.get("citation_validation", {}),
            "action_plan": generated.get("action_plan"),
            "retrieval": {
                "requested_mode": retrieval_mode,
                "execution_mode": chosen_mode,
                "top_k": top_k,
                "db_results_count": len(db_results),
                "doc_results_count": len(doc_results),
                "has_user_context": user_context is not None,
                "route": route_info,
            },
        }
