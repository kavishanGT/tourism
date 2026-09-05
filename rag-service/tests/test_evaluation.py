from evaluation.evaluate import (
    calculate_aggregate_metrics,
    calculate_latency_stats,
    hit_at_k,
    reciprocal_rank,
)


def make_result(
    filename: str,
):
    return {
        "metadata": {
            "file_name": filename
        }
    }


def test_hit_at_k():
    results = [
        make_result(
            "wrong.pdf"
        ),
        make_result(
            "Adventure_Tourism_Toolkit.pdf"
        ),
    ]

    assert (
        hit_at_k(
            results,
            [
                "Adventure_Tourism_Toolkit.pdf"
            ],
        )
        == 1
    )


def test_hit_at_k_failure():
    results = [
        make_result(
            "wrong.pdf"
        )
    ]

    assert (
        hit_at_k(
            results,
            [
                "Adventure_Tourism_Toolkit.pdf"
            ],
        )
        == 0
    )


def test_reciprocal_rank():
    results = [
        make_result("wrong.pdf"),
        make_result(
            "Adventure_Tourism_Toolkit.pdf"
        ),
    ]

    assert (
        reciprocal_rank(
            results,
            [
                "Adventure_Tourism_Toolkit.pdf"
            ],
        )
        == 0.5
    )


def test_calculate_latency_stats():
    eval_results = [
        {"latency_ms": 100.0},
        {"latency_ms": 200.0},
        {"latency_ms": 300.0},
    ]

    stats = calculate_latency_stats(
        eval_results
    )
    assert stats["mean_ms"] == 200.0
    assert stats["p50_ms"] == 200.0
    assert stats["p95_ms"] == 300.0
