import sys
from pathlib import Path

# Ensure project root is in sys.path when executed directly
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import argparse
import json
import statistics
import time
from collections import Counter
from datetime import datetime, timezone

from app.core.config import settings
from app.services.rag_dependencies import (
    get_hybrid_rerank_retriever,
    get_hybrid_retriever,
    get_retriever,
)




QUESTIONS_FILE = Path(
    "evaluation/questions.json"
)

RESULTS_DIR = Path(
    "evaluation/results"
)

K_VALUES = [1, 3, 5, 10]


def load_questions(
    path: Path,
):
    if not path.exists() or path.stat().st_size == 0:
        return []
    try:
        with path.open(
            "r",
            encoding="utf-8",
        ) as file:
            return json.load(file)
    except json.JSONDecodeError:
        return []


def normalize_filename(
    filename: str,
) -> str:
    return (
        filename
        .strip()
        .lower()
    )


def source_matches(
    returned_source: str | None,
    expected_sources: list[str],
) -> bool:
    if not returned_source:
        return False

    returned = normalize_filename(
        returned_source
    )

    expected = {
        normalize_filename(source)
        for source in expected_sources
    }

    return returned in expected


def hit_at_k(
    results,
    expected_sources,
):
    for result in results:
        metadata = result.get(
            "metadata",
            {},
        )

        source = metadata.get(
            "file_name"
        )

        if source_matches(
            source,
            expected_sources,
        ):
            return 1

    return 0


def recall_at_k(
    results,
    expected_sources,
):
    return hit_at_k(
        results,
        expected_sources,
    )


def reciprocal_rank(
    results,
    expected_sources,
):
    for index, result in enumerate(
        results,
        start=1,
    ):
        metadata = result.get(
            "metadata",
            {},
        )

        source = metadata.get(
            "file_name"
        )

        if source_matches(
            source,
            expected_sources,
        ):
            return 1.0 / index

    return 0.0


def calculate_multi_k_metrics(
    result,
    k_values=K_VALUES,
):
    metrics = {}

    expected_sources = (
        result["expected_sources"]
    )

    retrieved = result["results"]

    for k in k_values:
        top_results = retrieved[:k]

        hit = hit_at_k(
            top_results,
            expected_sources,
        )

        rr = reciprocal_rank(
            top_results,
            expected_sources,
        )

        metrics[f"hit@{k}"] = hit
        metrics[f"recall@{k}"] = hit
        metrics[f"mrr@{k}"] = rr

    return metrics


class RetrievalEvaluator:

    def __init__(
        self,
        mode: str = "dense",
        retriever=None,
    ):
        self.mode = mode
        if retriever:
            self.retriever = retriever
        elif mode == "hybrid":
            self.retriever = get_hybrid_retriever()
        elif mode == "hybrid_rerank":
            self.retriever = get_hybrid_rerank_retriever()
        else:
            self.retriever = get_retriever()

    def evaluate_question(
        self,
        question,
        max_k=10,
        k_values=K_VALUES,
    ):
        query = question["query"]
        expected_sources = question["expected_sources"]

        start_time = time.perf_counter()
        
        # Retrieve max_k candidates from selected retriever
        if hasattr(self.retriever, "retrieve"):
            # Check if retriever accepts candidate_k or top_k
            try:
                results = self.retriever.retrieve(query=query, top_k=max_k)
            except TypeError:
                results = self.retriever.retrieve(query=query)
        else:
            results = []

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        formatted_results = []
        for rank, result in enumerate(results, start=1):
            metadata = result.get("metadata", {})
            formatted_results.append({
                "rank": rank,
                "id": str(result.get("id", "")),
                "score": result.get("score", result.get("hybrid_score", result.get("rerank_score", 0.0))),
                "content": result.get("content", ""),
                "metadata": metadata,
            })

        eval_result = {
            "id": question["id"],
            "query": query,
            "expected_sources": expected_sources,
            "latency_ms": elapsed_ms,
            "hit_at_k": hit_at_k(formatted_results[:5], expected_sources),
            "reciprocal_rank": reciprocal_rank(formatted_results[:5], expected_sources),
            "results": formatted_results,
        }

        eval_result["metrics"] = calculate_multi_k_metrics(eval_result, k_values)
        return eval_result

    def evaluate(
        self,
        questions,
        max_k=10,
        k_values=K_VALUES,
    ):
        results = []
        for index, question in enumerate(questions, start=1):
            print(
                f"[{index}/{len(questions)}] "
                f"{question['id']}: "
                f"{question['query']}"
            )
            result = self.evaluate_question(question, max_k=max_k, k_values=k_values)
            results.append(result)
        return results


def calculate_aggregate_metrics(
    results,
    k_values=K_VALUES,
):
    if not results:
        return {
            "question_count": 0,
            **{f"recall@{k}": 0.0 for k in k_values},
            **{f"failed@{k}": 0 for k in k_values},
            "mrr@5": 0.0,
        }

    count = len(results)
    metrics = {"question_count": count}

    for k in k_values:
        recall_k = sum(r["metrics"][f"recall@{k}"] for r in results) / count
        failed_k = sum(1 for r in results if r["metrics"][f"hit@{k}"] == 0)
        metrics[f"recall@{k}"] = round(recall_k, 4)
        metrics[f"failed@{k}"] = failed_k

    mrr5 = sum(r["metrics"]["mrr@5"] for r in results) / count
    metrics["mrr@5"] = round(mrr5, 4)

    return metrics


def calculate_latency_stats(results):
    latencies = [r["latency_ms"] for r in results if "latency_ms" in r]
    if not latencies:
        return {"mean_ms": 0.0, "p50_ms": 0.0, "p95_ms": 0.0}

    sorted_lat = sorted(latencies)
    mean_ms = round(sum(latencies) / len(latencies), 2)
    p50_ms = round(statistics.median(sorted_lat), 2)
    p95_idx = int(0.95 * len(sorted_lat))
    p95_ms = round(sorted_lat[min(p95_idx, len(sorted_lat) - 1)], 2)

    return {
        "mean_ms": mean_ms,
        "p50_ms": p50_ms,
        "p95_ms": p95_ms,
    }


def source_distribution(results):
    counter = Counter()
    for result in results:
        for retrieved in result["results"]:
            source = retrieved["metadata"].get("file_name")
            if source:
                counter[source] += 1
    return dict(counter)


def get_failed_questions(results):
    return [
        {
            "id": result["id"],
            "query": result["query"],
            "expected_sources": result["expected_sources"],
            "top_results": [
                {
                    "rank": item["rank"],
                    "score": item["score"],
                    "file_name": item["metadata"].get("file_name"),
                }
                for item in result["results"]
            ],
        }
        for result in results
        if result["metrics"].get("hit@5", 0) == 0
    ]


def save_report(report, output_path: Path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as file:
        json.dump(report, file, indent=2, ensure_ascii=False)


def main():
    parser = argparse.ArgumentParser(description="RAG Retrieval Evaluation Benchmark")
    parser.add_argument(
        "--mode",
        choices=["dense", "hybrid", "hybrid_rerank"],
        default="dense",
        help="Retrieval mode: dense, hybrid, or hybrid_rerank",
    )
    args = parser.parse_args()

    questions = load_questions(QUESTIONS_FILE)
    print(f"Loaded {len(questions)} evaluation questions.")
    print(f"Running evaluation in mode: {args.mode.upper()}")
    print()

    evaluator = RetrievalEvaluator(mode=args.mode)
    results = evaluator.evaluate(questions, max_k=10, k_values=K_VALUES)

    metrics = calculate_aggregate_metrics(results, k_values=K_VALUES)
    latency_stats = calculate_latency_stats(results)
    dist = source_distribution(results)
    failed = get_failed_questions(results)

    report = {
        "evaluation": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "retrieval_mode": args.mode,
            "embedding_model": settings.embedding_model,
            "reranker_model": settings.reranker_model if args.mode == "hybrid_rerank" else None,

            "vector_database": "Qdrant",
            "collection": "tourism_knowledge",
            "k_values": K_VALUES,
            "dataset": str(QUESTIONS_FILE),
        },
        "metrics": metrics,
        "latency": latency_stats,
        "source_distribution": dist,
        "failed_questions": failed,
        "questions": results,
    }

    output_path = RESULTS_DIR / f"{args.mode}_retrieval_baseline.json"
    save_report(report, output_path)

    print()
    print(f"========== RETRIEVAL EVALUATION (mode: {args.mode}) ==========")
    print(f"Questions : {metrics['question_count']}")
    print(f"Recall@1  : {metrics.get('recall@1', 0.0):.4f}")
    print(f"Recall@3  : {metrics.get('recall@3', 0.0):.4f}")
    print(f"Recall@5  : {metrics.get('recall@5', 0.0):.4f}")
    print(f"Recall@10 : {metrics.get('recall@10', 0.0):.4f}")
    print(f"MRR@5     : {metrics.get('mrr@5', 0.0):.4f}")
    print()
    print(f"Failed@1  : {metrics.get('failed@1', 0)}")
    print(f"Failed@3  : {metrics.get('failed@3', 0)}")
    print(f"Failed@5  : {metrics.get('failed@5', 0)}")
    print(f"Failed@10 : {metrics.get('failed@10', 0)}")
    print()
    print(f"Latency   : mean={latency_stats['mean_ms']}ms, p50={latency_stats['p50_ms']}ms, p95={latency_stats['p95_ms']}ms")
    print("================================================================")
    print(f"Report saved to: {output_path}")


if __name__ == "__main__":
    main()