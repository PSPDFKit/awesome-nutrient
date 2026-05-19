"""End-to-end ingestion CLI: PDFs in `./pdfs/` → Chroma collection."""
from __future__ import annotations

import asyncio
import hashlib
import os
import pathlib

from tqdm import tqdm

from ingestion.chunk import split_by_heading
from ingestion.embed import embed
from ingestion.extract import pdf_to_markdown
from ingestion.store import upsert


async def ingest(folder: str | None = None) -> None:
    folder = folder or os.environ.get("PDF_FOLDER", "pdfs")
    pdf_paths = list(pathlib.Path(folder).glob("*.pdf"))
    if not pdf_paths:
        print(f"No PDFs in ./{folder}/. Drop one in and re-run.")
        return

    for pdf in pdf_paths:
        md = await pdf_to_markdown(pdf)
        chunks = split_by_heading(md)
        ids = [
            hashlib.sha1(f"{pdf.name}-{i}".encode()).hexdigest()
            for i in range(len(chunks))
        ]
        docs = [c["text"] for c in chunks]
        metas = [{"source": pdf.name, "section": c["title"]} for c in chunks]
        for i in tqdm(range(0, len(docs), 64), desc=pdf.name):
            batch_ids = ids[i : i + 64]
            batch_docs = docs[i : i + 64]
            batch_metas = metas[i : i + 64]
            upsert(
                ids=batch_ids,
                docs=batch_docs,
                metas=batch_metas,
                embeddings=embed(batch_docs),
            )


if __name__ == "__main__":
    asyncio.run(ingest())
