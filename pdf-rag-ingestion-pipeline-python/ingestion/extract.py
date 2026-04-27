"""Convert a PDF to Markdown using the Nutrient DWS Processor API."""
from __future__ import annotations

import asyncio
import pathlib

from dotenv import load_dotenv
from nutrient_dws import NutrientClient

load_dotenv()


async def pdf_to_markdown(pdf_path: pathlib.Path) -> str:
    """Convert a single PDF file to Markdown via Nutrient DWS.

    Uses the official `nutrient-dws` Python client. Reads
    ``NUTRIENT_API_KEY`` from the environment.
    """
    async with NutrientClient() as client:
        result = await client.convert(str(pdf_path), "markdown")
        return result.buffer.decode("utf-8")


async def _main() -> None:
    sample = pathlib.Path("pdfs").glob("*.pdf")
    pdf = next(sample, None)
    if pdf is None:
        print("Drop a PDF into ./pdfs first.")
        return
    md = await pdf_to_markdown(pdf)
    print(md[:500])


if __name__ == "__main__":
    asyncio.run(_main())
