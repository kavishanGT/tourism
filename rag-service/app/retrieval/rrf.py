def reciprocal_rank_fusion(
    result_lists,
    k=60,
):

    scores = {}

    documents = {}

    for results in result_lists:

        for rank, result in enumerate(
            results,
            start=1,
        ):

            document_id = result["id"]

            scores.setdefault(
                document_id,
                0.0,
            )

            scores[document_id] += (
                1.0
                / (k + rank)
            )

            documents[
                document_id
            ] = result

    ranked = sorted(
        scores.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    output = []

    for document_id, score in ranked:

        result = documents[
            document_id
        ].copy()

        result[
            "hybrid_score"
        ] = score

        output.append(result)

    return output