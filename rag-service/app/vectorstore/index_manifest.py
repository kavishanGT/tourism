import json
from pathlib import Path
from typing import Any


class IndexManifest:

    def __init__(self, path: Path):
        self.path = path

        self.path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        if not self.path.exists() or self.path.stat().st_size == 0:
            self._write({
                "documents": {}
            })

    def _read(self) -> dict[str, Any]:
        if not self.path.exists() or self.path.stat().st_size == 0:
            return {"documents": {}}

        try:
            with self.path.open(
                "r",
                encoding="utf-8",
            ) as file:
                return json.load(file)
        except json.JSONDecodeError:
            return {"documents": {}}

    def _write(self, data: dict[str, Any]):
        temp = self.path.with_suffix(
            ".tmp"
        )

        with temp.open(
            "w",
            encoding="utf-8",
        ) as file:
            json.dump(
                data,
                file,
                indent=2,
                ensure_ascii=False,
            )

        temp.replace(self.path)

    def get_document(
        self,
        document_id: str,
    ) -> dict[str, Any] | None:
        data = self._read()

        return data.get(
            "documents",
            {},
        ).get(document_id)

    def upsert_document(
        self,
        document_id: str,
        file_hash: str,
        chunk_count: int,
    ):
        data = self._read()

        if "documents" not in data:
            data["documents"] = {}

        data["documents"][
            document_id
        ] = {
            "file_hash": file_hash,
            "chunk_count": chunk_count,
        }

        self._write(data)