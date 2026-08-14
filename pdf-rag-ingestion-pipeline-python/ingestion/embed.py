"""Embed text chunks with OpenAI."""
from __future__ import annotations

import os

from openai import OpenAI

_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))
_model = os.environ.get("EMBEDDING_MODEL", "text-embedding-3-small")


def embed(texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts with the configured OpenAI model."""
    response = _client.embeddings.create(model=_model, input=texts)
    return [d.embedding for d in response.data]
