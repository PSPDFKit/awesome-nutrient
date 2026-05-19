# PDF RAG Ingestion Pipeline (Python)

End-to-end ingestion pipeline for AI document apps: **PDF → Markdown → chunks → embeddings → retrieval → LLM answer**, powered by [Nutrient's PDF-to-Markdown API](https://www.nutrient.io/api/pdf-to-md-api/).

Companion code for the tutorial:
[Build a PDF ingestion pipeline for AI apps in Python](https://www.nutrient.io/blog/build-pdf-rag-ingestion-pipeline-python/).

This example lives inside the [awesome-nutrient](https://github.com/PSPDFKit/awesome-nutrient) examples repo. See the root [README](../README.md) for other Nutrient examples.

## Why this exists

Most "I built a RAG app" tutorials skip the part that breaks in production: getting clean text out of real PDFs. Page-noise, broken tables, and lost reading order quietly degrade every chunk that hits your vector DB — and that shows up as bad retrievals, not as crashes.

This repo turns a folder of PDFs into a queryable index for an LLM in five minutes, using:

- **[Nutrient DWS Processor API](https://www.nutrient.io/api/pdf-to-md-api/)** for PDF → Markdown
- **OpenAI `text-embedding-3-small`** for embeddings
- **Chroma** for local vector storage (swap to Pinecone, pgvector, Weaviate, or Qdrant by replacing `ingestion/store.py`)
- **Anthropic Claude** for the answer step (swap to OpenAI by editing `retrieval/ask.py`)

## Quickstart (5 minutes)

```bash
git clone https://github.com/PSPDFKit/awesome-nutrient.git
cd awesome-nutrient/pdf-rag-ingestion-pipeline-python
python -m venv .venv && source .venv/bin/activate
pip install -e '.[dev]'
cp .env.example .env
# add your NUTRIENT_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY to .env
cp samples/*.pdf pdfs/
python run.py
python -m retrieval.ask "What does this document describe?"
```

## Choosing the right Nutrient path

There isn't one Nutrient path for AI document ingestion — there are three. Pick by data residency, document type, and output shape:

| Use case                                          | Nutrient path                                                                          | Tradeoff                                          |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Born-digital PDFs, fastest path to working RAG    | [PDF-to-Markdown API](https://www.nutrient.io/api/pdf-to-md-api/) (this repo)          | Cloud API. Documents are POSTed to Nutrient.      |
| Born-digital PDFs, must run locally / no upload   | [`@pspdfkit/pdf-to-markdown` CLI / Claude Code skill](https://www.nutrient.io/ai/skills/pdf-to-markdown/) | Node CLI. No OCR yet.                             |
| Scanned, image-only, or handwriting PDFs          | [Nutrient Python SDK with OCR/ICR engines](https://www.nutrient.io/sdk/python/pdf-data-extraction/) | On-prem. Heavier setup, supports tougher inputs.  |
| Tables and key-value pairs as JSON, not Markdown  | [Data-extraction API](https://www.nutrient.io/api/data-extraction-api/)                | Different output shape. Better for forms.         |

## Repo structure

```
pdf-rag-ingestion-pipeline-python/
├─ README.md
├─ LICENSE
├─ pyproject.toml
├─ Makefile
├─ .env.example
├─ pdfs/                     # drop your PDFs here
├─ samples/                  # one small public-domain PDF for `make demo`
├─ ingestion/
│  ├─ extract.py             # PDF -> Markdown via Nutrient
│  ├─ chunk.py               # Markdown -> chunks
│  ├─ embed.py               # chunks -> vectors
│  └─ store.py               # vectors -> Chroma
├─ retrieval/
│  └─ ask.py                 # query -> top-k context -> LLM answer
├─ run.py                    # end-to-end CLI
└─ tests/
```

## Configuration

All knobs live in `.env`:

```env
# Required
NUTRIENT_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Optional
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=claude-sonnet-4-6
VECTOR_DB_PATH=.chroma
PDF_FOLDER=pdfs
```

## Production checklist

- **Cache extraction.** Hash PDF bytes and skip re-extraction on unchanged files.
- **Build an evaluation set.** ~20 questions per document type. Track retrieval hit-rate and answer correctness over time.
- **Scanned PDFs.** Route through [Nutrient's Python SDK with OCR/ICR engines](https://www.nutrient.io/sdk/python/pdf-data-extraction/) before this pipeline.
- **Tables and key-values as data**, not Markdown — see [data-extraction API](https://www.nutrient.io/api/data-extraction-api/).
- **Observability.** Log Markdown length, chunk count, embedding model, retrieval top-k.


## Benchmarks

For a published, reproducible benchmark of Nutrient's open-source [PDF-to-Markdown CLI](https://www.nutrient.io/ai/skills/pdf-to-markdown/) against Docling, MarkItDown, pypdf, pymupdf4llm, and liteparse — including reading order, table structure, heading detection, and speed — see the [PDF-to-Markdown skill page](https://www.nutrient.io/ai/skills/pdf-to-markdown/). Numbers there were measured with the local CLI; if you need a head-to-head against the cloud Markdown endpoint specifically, run the comparison on your own document mix.

## License

See [LICENSE](./LICENSE) — modified BSD, same terms as other examples in [awesome-nutrient](https://github.com/PSPDFKit/awesome-nutrient).

The Nutrient PDF-to-Markdown API and Processor backend are proprietary; usage is governed by your DWS subscription. Free trial available at [dashboard.nutrient.io](https://dashboard.nutrient.io/).
