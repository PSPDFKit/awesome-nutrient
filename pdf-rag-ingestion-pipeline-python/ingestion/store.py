"""Persist chunk embeddings in a local Chroma collection."""
from __future__ import annotations

import os

import chromadb

_client = chromadb.PersistentClient(path=os.environ.get("VECTOR_DB_PATH", ".chroma"))
_collection = _client.get_or_create_collection("pdf-rag")


def upsert(
    ids: list[str],
    docs: list[str],
    metas: list[dict],
    embeddings: list[list[float]],
) -> None:
    """Upsert a batch of chunks into the local Chroma collection."""
    _collection.upsert(ids=ids, documents=docs, metadatas=metas, embeddings=embeddings)


def query(question: str, k: int = 6) -> dict:
    """Query the collection for top-k chunks matching the question."""
    return _collection.query(query_texts=[question], n_results=k)
