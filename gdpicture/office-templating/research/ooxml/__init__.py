"""Minimal OOXML authoring helpers for the demo templates.

Templates are built as XML rather than authored in Office for three reasons:

* Word splits runs mid-word, which silently breaks a ``{{placeholder}}``;
* hand-editing a real .xlsx produced a duplicate-cell corruption that only Excel
  flagged (see research/FINDINGS.md §8);
* generated packages are diffable and reproducible.

Each module writes one format. They share the brand palette below so every template
looks like it belongs to the same set.
"""

# Nutrient brand — see nutrient-design-kit/TOKENS.md. Hex without the '#', as OOXML wants.
ACCENT = "F25E45"       # Code Coral
INK = "1A1414"          # Warm Black
MUTED = "67594B"        # Warm Grey
RULE = "E2DBD9"         # Pixel Mist — borders
BAND = "F2EFEC"         # table header fill
POSITIVE = "3C7645"     # Data Green, darkened for contrast on white
WARN = "87640D"         # Digital Pollen, darkened for contrast on white
INFO = "B03B8F"         # Disc Pink, darkened for contrast on white

FONT = "Archivo"

__all__ = [
    "ACCENT", "INK", "MUTED", "RULE", "BAND", "POSITIVE", "WARN", "INFO", "FONT",
    "esc",
]


def esc(text):
    """Escapes text for an XML text node.

    Applied to every string that reaches the XML, including placeholder names — a
    stray ``&`` in a template would otherwise produce an unopenable package.
    """
    return (str(text)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;"))
