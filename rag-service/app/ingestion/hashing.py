from hashlib import sha256
from pathlib import Path


def calculate_file_hash(
    file_path: Path,
) -> str:

    digest = sha256()

    with file_path.open("rb") as file:

        while True:

            chunk = file.read(1024 * 1024)

            if not chunk:
                break

            digest.update(chunk)

    return digest.hexdigest()


def calculate_content_hash(
    content: str,
) -> str:

    return sha256(
        content.encode("utf-8")
    ).hexdigest()

def generate_document_id(
    file_hash: str,
) -> str:

    return f"doc_{file_hash[:16]}"