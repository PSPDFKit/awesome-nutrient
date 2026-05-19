.PHONY: install ingest ask demo lint test clean

install:
	python -m venv .venv && . .venv/bin/activate && pip install -e '.[dev]'

ingest:
	python run.py

ask:
	@if [ -z "$(Q)" ]; then echo "Usage: make ask Q=\"your question\""; exit 1; fi
	python -m retrieval.ask "$(Q)"

demo:
	cp samples/*.pdf pdfs/ 2>/dev/null || true
	python run.py
	python -m retrieval.ask "What does this document describe?"

lint:
	ruff check .
	ruff format --check .
	mypy ingestion retrieval

test:
	pytest -q

clean:
	rm -rf .chroma .venv .pytest_cache .ruff_cache .mypy_cache
	find . -name __pycache__ -type d -exec rm -rf {} +
