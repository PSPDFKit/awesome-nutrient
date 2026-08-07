#!/usr/bin/env python3
"""Pitch deck — the one-slide-per-entry showcase (PPTX).

The résumé deck loops *within* slides. This one loops a whole slide: a single
`{{#milestones}}` section wrapping one slide's worth of shapes, so the deck grows a
slide per entry. That's the construct a deck generator actually needs.

Slide sequence follows the conventional order — problem, solution, market, traction,
milestones, team, ask.
"""

from pathlib import Path

from ooxml import ACCENT, INK, MUTED, POSITIVE, pptx

OUT = (Path(__file__).resolve().parent.parent
       / "src" / "NutrientOfficeTemplating" / "Templates" / "pitch.pptx")

box, text, runs, blank = pptx.textbox, pptx.text, pptx.runs, pptx.blank
inches = pptx.inches

# A consistent grid: a wide content column with generous margins.
LEFT = inches(0.9)
COL = inches(11.5)
HALF = inches(5.5)
RIGHT_COL = inches(6.9)


def eyebrow(label, y=inches(0.7)):
    """The small muted kicker every slide carries, so the deck reads as a set."""
    return box("Eyebrow", LEFT, y, COL, inches(0.4),
               [text(label, size=1200, color=MUTED)])


def slide_title(value, y=inches(1.15), size=3600):
    return box("Title", LEFT, y, COL, inches(1.3),
               [text(value, size=size, bold=True, color=INK)])


slides = []

# ---- 1. Cover
slides.append(pptx.slide([
    box("Cover", LEFT, inches(2.4), COL, inches(2.4), [
        text("{{company.name}}", size=5400, bold=True, color=INK),
        text("{{company.tagline}}", size=2000, color=MUTED, spacing_before=600),
    ]),
    box("Meta", LEFT, inches(5.6), COL, inches(0.9), [
        runs(("{{company.stage}}", {"size": 1400, "bold": True, "color": ACCENT}),
             ("   ·   ", {"size": 1400, "color": MUTED}),
             ("{{company.location}}", {"size": 1400, "color": MUTED}),
             ("   ·   ", {"size": 1400, "color": MUTED}),
             ("{{deckDate}}", {"size": 1400, "color": MUTED})),
    ]),
]))

# ---- 2. Problem — a loop within one slide.
slides.append(pptx.slide([
    eyebrow("THE PROBLEM"),
    slide_title("{{problem.headline}}"),
    box("Lede", LEFT, inches(2.5), COL, inches(0.9),
        [text("{{problem.summary}}", size=1700, color=MUTED)]),
    box("Points", LEFT, inches(3.5), COL, inches(2.6), [
        text("{{#problem.points}}", size=1100, color=MUTED),
        runs(("•   ", {"size": 1600, "color": ACCENT}),
             ("{{text}}", {"size": 1600})),
        text("{{/problem.points}}", size=1100, color=MUTED),
        blank(),
    ]),
]))

# ---- 3. Solution
slides.append(pptx.slide([
    eyebrow("THE SOLUTION"),
    slide_title("{{solution.headline}}"),
    box("Lede", LEFT, inches(2.5), COL, inches(1.0),
        [text("{{solution.summary}}", size=1700, color=MUTED)]),
    box("Caps", LEFT, inches(3.6), COL, inches(2.4), [
        text("{{#solution.capabilities}}", size=1100, color=MUTED),
        runs(("{{name}}", {"size": 1600, "bold": True}),
             ("  —  ", {"size": 1600, "color": MUTED}),
             ("{{detail}}", {"size": 1600, "color": MUTED})),
        text("{{/solution.capabilities}}", size=1100, color=MUTED),
        blank(),
    ]),
]))

# ---- 4. Market — three figures side by side.
slides.append(pptx.slide([
    eyebrow("MARKET"),
    slide_title("{{market.headline}}"),
    box("TAM", LEFT, inches(2.7), inches(3.5), inches(1.6), [
        text("{{market.tam}}", size=4000, bold=True, color=ACCENT),
        text("Total addressable", size=1200, color=MUTED),
    ]),
    box("SAM", inches(4.6), inches(2.7), inches(3.5), inches(1.6), [
        text("{{market.sam}}", size=4000, bold=True, color=INK),
        text("Serviceable", size=1200, color=MUTED),
    ]),
    box("Growth", inches(8.3), inches(2.7), inches(3.5), inches(1.6), [
        text("{{market.growth}}", size=4000, bold=True, color=INK),
        text("Annual growth", size=1200, color=MUTED),
    ]),
    box("Note", LEFT, inches(4.8), COL, inches(1.0),
        [text("{{market.note}}", size=1500, color=MUTED)]),
]))

# ---- 5. Traction — metrics loop.
slides.append(pptx.slide([
    eyebrow("TRACTION"),
    slide_title("{{traction.headline}}"),
    box("Metrics", LEFT, inches(2.6), COL, inches(3.4), [
        text("{{#traction.metrics}}", size=1100, color=MUTED),
        runs(("{{value}}", {"size": 2400, "bold": True, "color": ACCENT}),
             ("   {{label}}", {"size": 1600, "color": MUTED}),
             ("   {{delta}}", {"size": 1400, "color": POSITIVE})),
        text("{{/traction.metrics}}", size=1100, color=MUTED),
        blank(),
    ]),
]))

# ---- 6. Milestones — a repeating block within one shape.
#
# NOTE: a section spanning several *shapes* does not repeat the slide. Tested: the
# engine consumed the content and left the slide nearly empty (see TEMPLATE-PLAN.md).
# A section must open and close inside a single shape, repeating the paragraphs it
# encloses — which is exactly how the Nutrient cv.pptx fixture does it.
slides.append(pptx.slide([
    eyebrow("MILESTONES"),
    slide_title("{{milestonesHeadline}}"),
    box("Milestones", LEFT, inches(2.5), COL, inches(3.6), [
        text("{{#milestones}}", size=1100, color=MUTED),
        runs(("{{quarter}}", {"size": 1300, "bold": True, "color": ACCENT}),
             ("   {{title}}", {"size": 1800, "bold": True})),
        text("{{detail}}", size=1500, color=MUTED),
        runs(("{{status}}", {"size": 1300, "bold": True}),
             ("   ·   {{owner}}", {"size": 1300, "color": MUTED}),
             ("   ·   {{targetDate}}", {"size": 1300, "color": MUTED})),
        blank(),
        text("{{/milestones}}", size=1100, color=MUTED),
    ]),
]))

# ---- 7. Team
slides.append(pptx.slide([
    eyebrow("TEAM"),
    slide_title("{{team.headline}}"),
    box("Members", LEFT, inches(2.6), COL, inches(3.4), [
        text("{{#team.members}}", size=1100, color=MUTED),
        runs(("{{name}}", {"size": 1800, "bold": True}),
             ("  ·  ", {"size": 1800, "color": MUTED}),
             ("{{role}}", {"size": 1600, "color": ACCENT})),
        text("{{background}}", size=1400, color=MUTED),
        text("{{/team.members}}", size=1100, color=MUTED),
        blank(),
    ]),
]))

# ---- 8. The ask
slides.append(pptx.slide([
    eyebrow("THE ASK"),
    slide_title("{{ask.amount}}", size=5400),
    box("Purpose", LEFT, inches(2.9), COL, inches(1.0),
        [text("{{ask.purpose}}", size=1800, color=MUTED)]),
    box("Uses", LEFT, inches(3.9), COL, inches(2.1), [
        text("{{#ask.useOfFunds}}", size=1100, color=MUTED),
        runs(("{{share}}", {"size": 1600, "bold": True, "color": ACCENT}),
             ("   {{purpose}}", {"size": 1600})),
        text("{{/ask.useOfFunds}}", size=1100, color=MUTED),
        blank(),
    ]),
    box("Contact", LEFT, inches(6.2), COL, inches(0.6),
        [runs(("{{company.contactName}}", {"size": 1400, "bold": True}),
              ("   ·   ", {"size": 1400, "color": MUTED}),
              ("{{company.contactEmail}}", {"size": 1400, "color": MUTED}))]),
]))

pptx.write(OUT, slides, doc_title="Pitch Deck Template")
print(f"wrote {OUT.relative_to(Path(__file__).resolve().parent.parent)} "
      f"({OUT.stat().st_size} bytes, {len(slides)} slides)")
