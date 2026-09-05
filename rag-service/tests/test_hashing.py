from pathlib import Path

from app.ingestion.hashing import (
    calculate_file_hash,
)


def test_file_hash_is_deterministic(
    tmp_path: Path,
):
    file_path = (
        tmp_path / "test.pdf"
    )

    file_path.write_bytes(
        b"test content"
    )

    hash1 = calculate_file_hash(
        file_path
    )

    hash2 = calculate_file_hash(
        file_path
    )

    assert hash1 == hash2
