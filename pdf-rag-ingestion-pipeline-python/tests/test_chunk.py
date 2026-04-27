"""Unit tests for the heading-aware Markdown splitter."""
from __future__ import annotations

from ingestion.chunk import split_by_heading


def test_no_headings_returns_single_chunk() -> None:
    md = "Just a paragraph of text without any headings."
    chunks = split_by_heading(md)
    assert len(chunks) == 1
    assert chunks[0]["title"] == "(untitled)"
    assert "paragraph" in chunks[0]["text"]


def test_single_heading_returns_one_chunk() -> None:
    md = "# Section A\n\nSome body text."
    chunks = split_by_heading(md)
    assert len(chunks) == 1
    assert chunks[0]["title"] == "Section A"
    assert "Some body text" in chunks[0]["text"]


def test_multiple_headings_split() -> None:
    md = (
        "# Intro\n\nIntro body.\n\n"
        "## Background\n\nBackground body.\n\n"
        "# Conclusion\n\nConcluding body."
    )
    chunks = split_by_heading(md)
    titles = [c["title"] for c in chunks]
    assert titles == ["Intro", "Background", "Conclusion"]


def test_long_section_is_soft_capped() -> None:
    body = "x" * 5000
    md = f"# Long\n\n{body}"
    chunks = split_by_heading(md, max_chars=1800)
    assert len(chunks) >= 3
    for c in chunks:
        assert len(c["text"]) <= 1800


def test_heading_levels_are_respected() -> None:
    md = "### Deep Heading\n\nbody"
    chunks = split_by_heading(md)
    assert chunks[0]["title"] == "Deep Heading"
