import json
from pathlib import Path
from typing import Any

import yaml


class SourceManifest:

    def __init__(
        self,
        path: Path,
    ):
        self.path = path

    def load(self) -> dict[str, Any]:
        if not self.path.exists():
            return {}

        with self.path.open(
            "r",
            encoding="utf-8",
        ) as file:
            return yaml.safe_load(
                file
            ) or {}

    def find_by_filename(
        self,
        filename: str,
    ) -> dict[str, Any] | None:
        data = self.load()

        for source in data.get(
            "sources",
            [],
        ):
            if (
                source.get("file_name")
                == filename
            ):
                return source

        return None


class ProcessingManifest:

    def __init__(
        self,
        path: Path,
    ):
        self.path = path

        self.path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        if not self.path.exists():
            self._write({
                "documents": []
            })

    def _read(self) -> dict[str, Any]:
        with self.path.open(
            "r",
            encoding="utf-8",
        ) as file:
            return json.load(file)

    def _write(
        self,
        data: dict[str, Any],
    ):
        temp_path = self.path.with_suffix(
            ".tmp"
        )

        with temp_path.open(
            "w",
            encoding="utf-8",
        ) as file:
            json.dump(
                data,
                file,
                indent=2,
                ensure_ascii=False,
            )

        temp_path.replace(
            self.path
        )

    def find_by_hash(
        self,
        file_hash: str,
    ) -> dict[str, Any] | None:
        data = self._read()

        return next(
            (
                item
                for item in data.get(
                    "documents",
                    [],
                )
                if item.get(
                    "file_hash"
                ) == file_hash
            ),
            None,
        )

    def add(
        self,
        document: dict[str, Any],
    ):
        data = self._read()

        data["documents"].append(
            document
        )

        self._write(data)
