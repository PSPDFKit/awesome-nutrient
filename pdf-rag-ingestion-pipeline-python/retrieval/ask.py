"""Retrieve top-k context from Chroma and ask Claude."""
from __future__ import annotations

import os
import sys

import anthropic

from ingestion.store import query

_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
_model = os.environ.get("LLM_MODEL", "claude-sonnet-4-6")


def ask(question: str, k: int = 6) -> str:
    """Answer a question using top-k retrieved chunks and Claude."""
    res = query(question, k=k)
    docs = res["documents"][0]
    sources = [f"{m['source']} — {m['section']}" for m in res["metadatas"][0]]
    context = "\n\n---\n\n".join(docs)
    msg = _client.messages.create(
        model=_model,
        max_tokens=800,
        messages=[
            {
                "role": "user",
                "content": (
                    "Answer the question using only the context. "
                    "Cite sources by section name when relevant.\n\n"
                    f"CONTEXT:\n{context}\n\nQUESTION: {question}"
                ),
            }
        ],
    )
    answer = msg.content[0].text if msg.content else ""
    return answer + "\n\nSources:\n" + "\n".join(sources)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python -m retrieval.ask "your question"')
        raise SystemExit(2)
    print(ask(sys.argv[1]))
