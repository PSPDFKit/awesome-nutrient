"""Heading-aware Markdown chunking for RAG ingestion."""
from __future__ import annotations

import re
from typing import TypedDict

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$", re.MULTILINE)


class Chunk(TypedDict):
    title: str
    text: str


def split_by_heading(md: str, max_chars: int = 1800) -> list[Chunk]:
    """Split Markdown into chunks by heading boundaries, soft-capped at max_chars.

    Falls back to a single chunk capped at max_chars when no headings are found
    so very small or unstructured documents still yield retrievable text.
    """
    headings = list(HEADING_RE.finditer(md))
    if not headings:
        return [{"title": "(untitled)", "text": md[:max_chars]}]

    sections: list[dict[str, str]] = []
    for i, h in enumerate(headings):
        end = headings[i + 1].start() if i + 1 < len(headings) else len(md)
        title = h.group(2).strip()
        body = md[h.end() : end].strip()
        sections.append({"title": title, "body": body})

    chunks: list[Chunk] = []
    for s in sections:
        text = f"# {s['title']}\n\n{s['body']}"
        for i in range(0, len(text), max_chars):
            chunks.append({"title": s["title"], "text": text[i : i + max_chars]})
    return chunks
