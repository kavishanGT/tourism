import re

CITATION_PATTERN = re.compile(r"\[(S\d+|DB\d+|USER_PROFILE|USER_FAV\d*|USER_TRIP\d*)\]")


class CitationValidator:

    def validate(
        self,
        answer: str,
        citations: list,
    ) -> dict:
        valid_ids = set()
        for citation in citations:
            if isinstance(citation, dict):
                cid = citation.get("citation_id", "")
                if cid:
                    valid_ids.add(cid)
            else:
                cid = getattr(citation, "citation_id", "")
                if cid:
                    valid_ids.add(cid)

        found_matches = CITATION_PATTERN.findall(answer)
        found_ids = set(found_matches)

        invalid_ids = found_ids - valid_ids

        return {
            "valid": not invalid_ids,
            "found": sorted(found_ids),
            "invalid": sorted(invalid_ids),
        }
