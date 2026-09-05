import re


class TextCleaner:

    def clean(
        self,
        text: str,
    ) -> str:

        text = text.replace(
            "\r\n",
            "\n",
        )

        text = text.replace(
            "\r",
            "\n",
        )

        # Remove null characters
        text = text.replace(
            "\x00",
            "",
        )

        # Normalize spaces
        text = re.sub(
            r"[ \t]+",
            " ",
            text,
        )

        # Normalize blank lines
        text = re.sub(
            r"\n{3,}",
            "\n\n",
            text,
        )

        lines = [
            line.strip()
            for line in text.split("\n")
        ]

        return "\n".join(lines).strip()
