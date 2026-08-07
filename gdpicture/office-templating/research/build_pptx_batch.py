#!/usr/bin/env python3
"""Authors the remaining PPTX templates.

Two constraints from earlier testing shape every deck here (see TEMPLATE-PLAN.md):

* a section cannot span shapes — wrapping a whole slide in `{{#items}}` consumes the
  content and leaves the slide nearly empty, with `Process()` still returning OK. Every
  loop below opens and closes inside a single text box;
* PPTX honours only `border` on images, ignoring alt text, links and captions, so no deck
  here promises image behaviour the format can't deliver.
"""

import json
from pathlib import Path

from ooxml import ACCENT, INK, MUTED, POSITIVE, WARN, pptx

TEMPLATES = (Path(__file__).resolve().parent.parent
             / "src" / "NutrientOfficeTemplating" / "Templates")

box, text, runs, blank, inches = pptx.textbox, pptx.text, pptx.runs, pptx.blank, pptx.inches

LEFT = inches(0.9)
COL = inches(11.5)


def write(name, slides, *, doc_title, model, meta):
    pptx.write(TEMPLATES / f"{name}.pptx", slides, doc_title=doc_title)

    with open(TEMPLATES / f"{name}.model.json", "w", encoding="utf8") as f:
        json.dump({"config": {"delimiter": {"start": "{{", "end": "}}"}}, "model": model},
                  f, indent=4, ensure_ascii=False)
        f.write("\n")

    with open(TEMPLATES / f"{name}.meta.json", "w", encoding="utf8") as f:
        json.dump(meta, f, indent=4, ensure_ascii=False)
        f.write("\n")

    print(f"  {name}.pptx ({(TEMPLATES / f'{name}.pptx').stat().st_size} bytes, "
          f"{len(slides)} slides)")


def eyebrow(label, y=inches(0.7)):
    return box("Eyebrow", LEFT, y, COL, inches(0.4),
               [text(label, size=1200, color=MUTED)])


def slide_title(value, y=inches(1.15), size=3600):
    return box("Title", LEFT, y, COL, inches(1.3),
               [text(value, size=size, bold=True, color=INK)])


# ------------------------------------------------------------------ QBR

def qbr():
    """Quarterly business review, internal form.

    The research was clear that internal and customer-facing QBRs are different decks,
    not one with a flag — they share only five slides. This is the internal one, anchored
    on quota and pipeline. It includes the "Decisions required" slide the research called
    the most-emphasised and most-omitted.
    """
    slides = [
        # Cover
        pptx.slide([
            box("Cover", LEFT, inches(2.4), COL, inches(2.2), [
                text("{{quarter}} business review", size=5000, bold=True, color=INK),
                text("{{team.name}}", size=2000, color=MUTED, spacing_before=600),
            ]),
            box("Meta", LEFT, inches(5.4), COL, inches(0.9), [
                runs(("{{presenter}}", {"size": 1400, "bold": True}),
                     ("   ·   ", {"size": 1400, "color": MUTED}),
                     ("{{reviewDate}}", {"size": 1400, "color": MUTED}),
                     ("   ·   Data as of {{dataAsOf}}", {"size": 1400, "color": MUTED})),
            ]),
        ]),

        # Executive summary — situation, complication, resolution, ask.
        pptx.slide([
            eyebrow("EXECUTIVE SUMMARY"),
            slide_title("{{summary.headline}}"),
            box("Summary", LEFT, inches(2.5), COL, inches(3.4), [
                text("{{summary.performance}}", size=1700, color=INK),
                text("{{summary.insight}}", size=1600, color=MUTED, spacing_before=500),
                runs(("The ask:  ", {"size": 1600, "bold": True, "color": ACCENT}),
                     ("{{summary.ask}}", {"size": 1600})),
                blank(),
            ]),
        ]),

        # Scorecard — plan vs actual, five to seven metrics.
        pptx.slide([
            eyebrow("SCORECARD"),
            slide_title("Against plan"),
            box("Scorecard", LEFT, inches(2.4), COL, inches(3.8), [
                runs(("METRIC", {"size": 1100, "bold": True, "color": MUTED}),
                     ("          PLAN          ACTUAL          VAR          STATUS",
                      {"size": 1100, "bold": True, "color": MUTED})),
                text("{{#scorecard}}", size=1000, color=MUTED),
                runs(("{{metric}}", {"size": 1500, "bold": True}),
                     ("     plan {{plan}}", {"size": 1400, "color": MUTED}),
                     ("     actual {{actual}}", {"size": 1400}),
                     ("     {{variance}}", {"size": 1400, "bold": True}),
                     ("     {{status}}", {"size": 1400, "color": ACCENT})),
                text("{{/scorecard}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        # ARR bridge.
        pptx.slide([
            eyebrow("REVENUE"),
            slide_title("{{arr.headline}}"),
            box("Bridge", LEFT, inches(2.5), COL, inches(2.6), [
                text("{{#arr.bridge}}", size=1000, color=MUTED),
                runs(("{{label}}", {"size": 1600, "color": MUTED}),
                     ("     {{value}}", {"size": 1800, "bold": True})),
                text("{{/arr.bridge}}", size=1000, color=MUTED),
                blank(),
            ]),
            box("Retention", LEFT, inches(5.3), COL, inches(1.0), [
                runs(("NRR {{arr.nrr}}", {"size": 1800, "bold": True, "color": ACCENT}),
                     ("      GRR {{arr.grr}}", {"size": 1800, "bold": True, "color": INK})),
            ]),
        ]),

        # Wins and misses, side by side.
        pptx.slide([
            eyebrow("WHAT WORKED, WHAT DIDN'T"),
            slide_title("{{outcomes.headline}}"),
            box("Wins", LEFT, inches(2.5), inches(5.4), inches(3.4), [
                text("Wins", size=1500, bold=True, color=POSITIVE),
                text("{{#outcomes.wins}}", size=1000, color=MUTED),
                text("{{result}}", size=1500, bold=True),
                text("{{driver}}", size=1300, color=MUTED),
                text("{{/outcomes.wins}}", size=1000, color=MUTED),
                blank(),
            ]),
            box("Misses", inches(6.6), inches(2.5), inches(5.4), inches(3.4), [
                text("Misses", size=1500, bold=True, color=ACCENT),
                text("{{#outcomes.misses}}", size=1000, color=MUTED),
                text("{{result}}", size=1500, bold=True),
                text("{{rootCause}}", size=1300, color=MUTED),
                text("{{correctiveAction}}", size=1300, color=MUTED),
                text("{{/outcomes.misses}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        # Pipeline and coverage.
        pptx.slide([
            eyebrow("PIPELINE"),
            slide_title("{{pipeline.headline}}"),
            box("Coverage", LEFT, inches(2.4), COL, inches(3.6), [
                text("{{#pipeline.segments}}", size=1000, color=MUTED),
                runs(("{{segment}}", {"size": 1500, "bold": True}),
                     ("     quota {{quota}}", {"size": 1400, "color": MUTED}),
                     ("     open {{openPipeline}}", {"size": 1400}),
                     ("     coverage {{coverage}}", {"size": 1400, "bold": True, "color": ACCENT})),
                text("{{/pipeline.segments}}", size=1000, color=MUTED),
                blank(),
            ]),
            box("Note", LEFT, inches(6.1), COL, inches(0.6),
                [text("{{pipeline.note}}", size=1300, color=MUTED)]),
        ]),

        # Risks with mitigations — the research noted "risk without mitigation is a worry,
        # not a slide", so both are required fields here.
        pptx.slide([
            eyebrow("RISKS"),
            slide_title("{{risks.headline}}"),
            box("Risks", LEFT, inches(2.4), COL, inches(3.6), [
                text("{{#risks.items}}", size=1000, color=MUTED),
                runs(("{{risk}}", {"size": 1500, "bold": True}),
                     ("     {{severity}}", {"size": 1300, "color": WARN})),
                text("{{mitigation}}", size=1300, color=MUTED),
                text("{{/risks.items}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        # Next quarter.
        pptx.slide([
            eyebrow("NEXT QUARTER"),
            slide_title("{{nextQuarter.headline}}"),
            box("Priorities", LEFT, inches(2.4), COL, inches(3.6), [
                text("{{#nextQuarter.priorities}}", size=1000, color=MUTED),
                runs(("{{priority}}", {"size": 1600, "bold": True}),
                     ("     {{owner}}", {"size": 1400, "color": MUTED}),
                     ("     {{measure}}", {"size": 1400, "color": ACCENT})),
                text("{{/nextQuarter.priorities}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        # Decisions required — dollar-quantified and owner-tagged.
        pptx.slide([
            eyebrow("DECISIONS REQUIRED"),
            slide_title("{{decisions.headline}}"),
            box("Decisions", LEFT, inches(2.4), COL, inches(3.6), [
                text("{{#decisions.items}}", size=1000, color=MUTED),
                runs(("{{decision}}", {"size": 1600, "bold": True}),
                     ("     {{costOfDelay}}", {"size": 1400, "color": ACCENT})),
                runs(("recommend: {{recommendation}}", {"size": 1300, "color": MUTED}),
                     ("     {{owner}} by {{deadline}}", {"size": 1300, "color": MUTED})),
                text("{{/decisions.items}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),
    ]

    model = {
        "quarter": "Q2 FY26",
        "team": {"name": "Solutions Engineering — EMEA"},
        "presenter": "Marta Feld",
        "reviewDate": "2026-07-16",
        "dataAsOf": "2026-06-30",
        "summary": {
            "headline": "Ahead on revenue, behind on ramp",
            "performance": "Net new ARR closed at 108% of plan, the third consecutive quarter above target.",
            "insight": "Growth came from expansion rather than new logos, which flatters the "
                       "quarter but leaves the new-business pipeline thin going into Q3.",
            "ask": "Approve two additional solutions engineers to unblock new-logo capacity.",
        },
        "scorecard": [
            {"metric": "Net new ARR", "plan": "1.20M", "actual": "1.30M",
             "variance": "+8%", "status": "Green"},
            {"metric": "Expansion ARR", "plan": "0.45M", "actual": "0.62M",
             "variance": "+38%", "status": "Green"},
            {"metric": "New logos", "plan": "14", "actual": "9",
             "variance": "-36%", "status": "Red"},
            {"metric": "Win rate", "plan": "26%", "actual": "24%",
             "variance": "-2 pts", "status": "Amber"},
            {"metric": "Sales cycle", "plan": "68 days", "actual": "74 days",
             "variance": "+9%", "status": "Amber"},
        ],
        "arr": {
            "headline": "Where the quarter's ARR came from",
            "bridge": [
                {"label": "Opening ARR", "value": "12.40M"},
                {"label": "New", "value": "+0.68M"},
                {"label": "Expansion", "value": "+0.62M"},
                {"label": "Contraction", "value": "-0.11M"},
                {"label": "Churn", "value": "-0.19M"},
                {"label": "Closing ARR", "value": "13.40M"},
            ],
            "nrr": "112%",
            "grr": "97%",
        },
        "outcomes": {
            "headline": "Expansion carried the quarter",
            "wins": [
                {"result": "Three six-figure expansions",
                 "driver": "Templating drove seat growth in existing accounts."},
                {"result": "Fastest enterprise close to date, 31 days",
                 "driver": "Pre-built accessibility evidence removed the security review."},
            ],
            "misses": [
                {"result": "New logos 9 against a plan of 14",
                 "rootCause": "Two engineers spent the quarter on delivery, not pre-sales.",
                 "correctiveAction": "Ring-fence pre-sales capacity from Q3."},
                {"result": "Win rate down two points",
                 "rootCause": "Losses concentrated in deals without an executive sponsor.",
                 "correctiveAction": "Sponsor identification added to stage-two exit criteria."},
            ],
        },
        "pipeline": {
            "headline": "Coverage is adequate overall, thin for new business",
            "segments": [
                {"segment": "Enterprise", "quota": "0.90M", "openPipeline": "3.60M", "coverage": "4.0x"},
                {"segment": "Mid-market", "quota": "0.60M", "openPipeline": "1.98M", "coverage": "3.3x"},
                {"segment": "New logo", "quota": "0.50M", "openPipeline": "1.15M", "coverage": "2.3x"},
            ],
            "note": "Coverage below 3.0x is treated as at risk. New-logo coverage has been "
                    "below that threshold for two quarters.",
        },
        "risks": {
            "headline": "What could take Q3 off plan",
            "items": [
                {"risk": "New-logo pipeline below coverage threshold", "severity": "High",
                 "mitigation": "Two hires requested; outbound campaign starts week 32."},
                {"risk": "Key-person dependency on one enterprise architect", "severity": "Medium",
                 "mitigation": "Cross-training scheduled; runbooks documented by end of August."},
            ],
        },
        "nextQuarter": {
            "headline": "Three priorities for Q3",
            "priorities": [
                {"priority": "Rebuild new-logo pipeline", "owner": "Marta Feld",
                 "measure": "3.0x coverage by 30 Sep"},
                {"priority": "Ring-fence pre-sales capacity", "owner": "Jordan Reyes",
                 "measure": "Zero delivery hours from pre-sales engineers"},
                {"priority": "Ship the accessibility evidence pack", "owner": "Tomas Brandt",
                 "measure": "Used in 100% of enterprise deals"},
            ],
        },
        "decisions": {
            "headline": "Two decisions needed today",
            "items": [
                {"decision": "Approve two solutions engineer hires",
                 "costOfDelay": "~0.35M of Q4 pipeline",
                 "recommendation": "Approve; start recruiting in week 32",
                 "owner": "Dana Whitfield", "deadline": "2026-07-31"},
                {"decision": "Confirm whether Q4 formats are in this phase",
                 "costOfDelay": "Two weeks of rework if decided late",
                 "recommendation": "Defer to the next phase",
                 "owner": "Dana Whitfield", "deadline": "2026-08-14"},
            ],
        },
    }

    write("qbr", slides, doc_title="Quarterly Business Review Template", model=model,
          meta={"order": 3, "title": "QBR deck",
                "subtitle": "Nine slides: scorecard, ARR bridge, pipeline, risks and decisions.",
                "features": ["Seven repeating blocks", "Sections under dotted paths",
                             "Wins/misses columns"]})


# ------------------------------------------------------------------ project kickoff

def kickoff():
    """Project kick-off deck — scope, team, plan, risks, ways of working."""
    slides = [
        pptx.slide([
            box("Cover", LEFT, inches(2.4), COL, inches(2.2), [
                text("{{project.name}}", size=5000, bold=True, color=INK),
                text("Project kick-off", size=2000, color=MUTED, spacing_before=600),
            ]),
            box("Meta", LEFT, inches(5.4), COL, inches(0.9), [
                runs(("{{project.client}}", {"size": 1400, "bold": True}),
                     ("   ·   ", {"size": 1400, "color": MUTED}),
                     ("{{project.startDate}} to {{project.endDate}}",
                      {"size": 1400, "color": MUTED})),
            ]),
        ]),

        pptx.slide([
            eyebrow("WHY WE'RE HERE"),
            slide_title("{{objectives.headline}}"),
            box("Objectives", LEFT, inches(2.5), COL, inches(3.4), [
                text("{{#objectives.items}}", size=1000, color=MUTED),
                runs(("•   ", {"size": 1600, "color": ACCENT}),
                     ("{{label}}", {"size": 1600})),
                text("{{/objectives.items}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        # In scope and out of scope, side by side — the out-of-scope column is the one
        # that prevents arguments later.
        pptx.slide([
            eyebrow("SCOPE"),
            slide_title("What's in, what's out"),
            box("In", LEFT, inches(2.4), inches(5.4), inches(3.6), [
                text("In scope", size=1500, bold=True, color=POSITIVE),
                text("{{#scope.inScope}}", size=1000, color=MUTED),
                text("{{label}}", size=1500),
                text("{{/scope.inScope}}", size=1000, color=MUTED),
                blank(),
            ]),
            box("Out", inches(6.6), inches(2.4), inches(5.4), inches(3.6), [
                text("Out of scope", size=1500, bold=True, color=ACCENT),
                text("{{#scope.outOfScope}}", size=1000, color=MUTED),
                text("{{label}}", size=1500),
                text("{{/scope.outOfScope}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        pptx.slide([
            eyebrow("TEAM"),
            slide_title("{{team.headline}}"),
            box("Team", LEFT, inches(2.4), COL, inches(3.6), [
                text("{{#team.members}}", size=1000, color=MUTED),
                runs(("{{name}}", {"size": 1600, "bold": True}),
                     ("     {{role}}", {"size": 1500, "color": ACCENT}),
                     ("     {{organisation}}", {"size": 1400, "color": MUTED})),
                text("{{responsibility}}", size=1300, color=MUTED),
                text("{{/team.members}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        pptx.slide([
            eyebrow("PLAN"),
            slide_title("{{plan.headline}}"),
            box("Phases", LEFT, inches(2.4), COL, inches(3.6), [
                text("{{#plan.phases}}", size=1000, color=MUTED),
                runs(("{{phase}}", {"size": 1600, "bold": True}),
                     ("     {{dates}}", {"size": 1400, "color": MUTED}),
                     ("     {{milestone}}", {"size": 1400, "color": ACCENT})),
                text("{{/plan.phases}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        pptx.slide([
            eyebrow("RISKS AND DEPENDENCIES"),
            slide_title("{{risks.headline}}"),
            box("Risks", LEFT, inches(2.4), COL, inches(3.6), [
                text("{{#risks.items}}", size=1000, color=MUTED),
                runs(("{{risk}}", {"size": 1500, "bold": True}),
                     ("     owner {{owner}}", {"size": 1300, "color": MUTED})),
                text("{{mitigation}}", size=1300, color=MUTED),
                text("{{/risks.items}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        pptx.slide([
            eyebrow("WAYS OF WORKING"),
            slide_title("{{cadence.headline}}"),
            box("Cadence", LEFT, inches(2.4), COL, inches(3.6), [
                text("{{#cadence.items}}", size=1000, color=MUTED),
                runs(("{{ceremony}}", {"size": 1600, "bold": True}),
                     ("     {{frequency}}", {"size": 1400, "color": ACCENT}),
                     ("     {{participants}}", {"size": 1400, "color": MUTED})),
                text("{{/cadence.items}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),
    ]

    model = {
        "project": {
            "name": "Document generation programme",
            "client": "Acme Corporation",
            "startDate": "2026-09-01",
            "endDate": "2026-11-14",
        },
        "objectives": {
            "headline": "Three outcomes this project must deliver",
            "items": [
                {"label": "Replace manual document assembly with templated generation."},
                {"label": "Produce PDF/UA-conformant output for every generated document."},
                {"label": "Leave the Acme team able to author new templates unaided."},
            ],
        },
        "scope": {
            "inScope": [
                {"label": "Word, Excel and PowerPoint template authoring — twelve templates."},
                {"label": "Generation service with a documented HTTP API."},
                {"label": "PDF/UA export and accessibility verification."},
                {"label": "Authoring documentation and one training session."},
            ],
            "outOfScope": [
                {"label": "Migration of historical documents."},
                {"label": "Changes to the upstream CRM or ERP systems."},
                {"label": "Translation or localisation of template content."},
                {"label": "Ongoing template authoring after handover."},
            ],
        },
        "team": {
            "headline": "Who's doing what",
            "members": [
                {"name": "Dana Whitfield", "role": "Sponsor", "organisation": "Acme",
                 "responsibility": "Accepts deliverables and resolves escalations."},
                {"name": "Marta Feld", "role": "Engagement lead", "organisation": "Nutrient",
                 "responsibility": "Owns delivery, scope and the weekly report."},
                {"name": "Jordan Reyes", "role": "Solutions engineer", "organisation": "Nutrient",
                 "responsibility": "Template authoring and the generation service."},
                {"name": "Tomas Brandt", "role": "Platform lead", "organisation": "Acme",
                 "responsibility": "Deployment, secrets and production access."},
            ],
        },
        "plan": {
            "headline": "Four phases over eleven weeks",
            "phases": [
                {"phase": "Discovery", "dates": "1–12 Sep", "milestone": "Audit accepted"},
                {"phase": "Authoring", "dates": "15 Sep – 3 Oct", "milestone": "Templates accepted"},
                {"phase": "Build", "dates": "6–31 Oct", "milestone": "Service in production"},
                {"phase": "Handover", "dates": "3–14 Nov", "milestone": "Training delivered"},
            ],
        },
        "risks": {
            "headline": "What we're watching from day one",
            "items": [
                {"risk": "Font licensing for the container image", "owner": "Acme Legal",
                 "mitigation": "Review booked for week 1; fallback fonts identified."},
                {"risk": "Source data quality in the CRM export", "owner": "Acme IT",
                 "mitigation": "Sample export requested before discovery ends."},
                {"risk": "Single reviewer for acceptance", "owner": "Dana Whitfield",
                 "mitigation": "Deputy nominated to avoid a single point of delay."},
            ],
        },
        "cadence": {
            "headline": "How we'll run",
            "items": [
                {"ceremony": "Weekly status", "frequency": "Wednesdays, 30 min",
                 "participants": "Engagement lead, platform lead"},
                {"ceremony": "Written status report", "frequency": "Fridays",
                 "participants": "Circulated to sponsor and team"},
                {"ceremony": "Phase acceptance", "frequency": "End of each phase",
                 "participants": "Sponsor, engagement lead"},
                {"ceremony": "Escalation", "frequency": "As needed, within one day",
                 "participants": "Sponsor"},
            ],
        },
    }

    write("kickoff", slides, doc_title="Project Kick-off Template", model=model,
          meta={"order": 4, "title": "Project kick-off",
                "subtitle": "Seven slides of objectives, scope, team, plan and cadence.",
                "features": ["Six repeating blocks", "In/out-of-scope columns",
                             "Sections under dotted paths"]})


# ------------------------------------------------------------------ training deck

def training():
    """Training deck — modules, each with objectives and exercises."""
    slides = [
        pptx.slide([
            box("Cover", LEFT, inches(2.4), COL, inches(2.2), [
                text("{{course.title}}", size=5000, bold=True, color=INK),
                text("{{course.subtitle}}", size=2000, color=MUTED, spacing_before=600),
            ]),
            box("Meta", LEFT, inches(5.4), COL, inches(0.9), [
                runs(("{{course.instructor}}", {"size": 1400, "bold": True}),
                     ("   ·   ", {"size": 1400, "color": MUTED}),
                     ("{{course.duration}}", {"size": 1400, "color": MUTED}),
                     ("   ·   {{course.level}}", {"size": 1400, "color": MUTED})),
            ]),
        ]),

        pptx.slide([
            eyebrow("WHAT YOU'LL LEARN"),
            slide_title("{{outcomes.headline}}"),
            box("Outcomes", LEFT, inches(2.5), COL, inches(3.4), [
                text("{{#outcomes.items}}", size=1000, color=MUTED),
                runs(("•   ", {"size": 1600, "color": ACCENT}),
                     ("{{label}}", {"size": 1600})),
                text("{{/outcomes.items}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        pptx.slide([
            eyebrow("AGENDA"),
            slide_title("{{agenda.headline}}"),
            box("Agenda", LEFT, inches(2.4), COL, inches(3.6), [
                text("{{#agenda.modules}}", size=1000, color=MUTED),
                runs(("{{number}}", {"size": 1400, "bold": True, "color": ACCENT}),
                     ("   {{title}}", {"size": 1600, "bold": True}),
                     ("     {{duration}}", {"size": 1400, "color": MUTED})),
                text("{{/agenda.modules}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        # Module detail — objectives and exercises on one slide.
        pptx.slide([
            eyebrow("MODULE DETAIL"),
            slide_title("{{modules.headline}}"),
            box("Modules", LEFT, inches(2.4), COL, inches(3.8), [
                text("{{#modules.items}}", size=1000, color=MUTED),
                runs(("{{title}}", {"size": 1600, "bold": True}),
                     ("     {{duration}}", {"size": 1300, "color": MUTED})),
                text("{{objective}}", size=1300, color=MUTED),
                runs(("Exercise:  ", {"size": 1300, "bold": True, "color": ACCENT}),
                     ("{{exercise}}", {"size": 1300, "color": MUTED})),
                text("{{/modules.items}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        pptx.slide([
            eyebrow("BEFORE YOU START"),
            slide_title("{{prerequisites.headline}}"),
            box("Prereqs", LEFT, inches(2.5), COL, inches(3.4), [
                text("{{#prerequisites.items}}", size=1000, color=MUTED),
                runs(("{{item}}", {"size": 1600, "bold": True}),
                     ("     {{detail}}", {"size": 1400, "color": MUTED})),
                text("{{/prerequisites.items}}", size=1000, color=MUTED),
                blank(),
            ]),
        ]),

        pptx.slide([
            eyebrow("GOING FURTHER"),
            slide_title("{{resources.headline}}"),
            box("Resources", LEFT, inches(2.5), COL, inches(3.4), [
                text("{{#resources.items}}", size=1000, color=MUTED),
                runs(("{{title}}", {"size": 1500, "bold": True}),
                     ("     {{where}}", {"size": 1400, "color": MUTED})),
                text("{{/resources.items}}", size=1000, color=MUTED),
                blank(),
            ]),
            box("Contact", LEFT, inches(6.1), COL, inches(0.6),
                [text("{{course.contact}}", size=1400, color=MUTED)]),
        ]),
    ]

    model = {
        "course": {
            "title": "Office templating with Nutrient",
            "subtitle": "Authoring templates and generating documents at scale",
            "instructor": "Jordan Reyes",
            "duration": "Half day, 3.5 hours",
            "level": "Intermediate",
            "contact": "Questions afterwards: training@nutrient.io",
        },
        "outcomes": {
            "headline": "By the end of this session you will be able to",
            "items": [
                {"label": "Author a Word, Excel or PowerPoint template with placeholders."},
                {"label": "Model repeating and conditional content in JSON."},
                {"label": "Generate documents from a template and a data model."},
                {"label": "Export accessible PDF/UA output and verify conformance."},
            ],
        },
        "agenda": {
            "headline": "Four modules",
            "modules": [
                {"number": "1", "title": "How templating works", "duration": "30 min"},
                {"number": "2", "title": "Authoring your first template", "duration": "60 min"},
                {"number": "3", "title": "Repeating and conditional content", "duration": "60 min"},
                {"number": "4", "title": "Accessible PDF output", "duration": "45 min"},
            ],
        },
        "modules": {
            "headline": "What each module covers",
            "items": [
                {"title": "1  How templating works", "duration": "30 min",
                 "objective": "The four SDK calls, and why the same code path serves all three formats.",
                 "exercise": "Generate the sample invoice unchanged."},
                {"title": "2  Authoring your first template", "duration": "60 min",
                 "objective": "Placeholder syntax, and why a marker must sit in a single run.",
                 "exercise": "Add three fields to a letterhead and generate it."},
                {"title": "3  Repeating and conditional content", "duration": "60 min",
                 "objective": "Sections, inverted sections, and table row loops.",
                 "exercise": "Build a line-item table that grows with the data."},
                {"title": "4  Accessible PDF output", "duration": "45 min",
                 "objective": "PDF/UA conformance, and what alt text does for generated images.",
                 "exercise": "Export a template to PDF/UA and inspect the tag tree."},
            ],
        },
        "prerequisites": {
            "headline": "What to have ready",
            "items": [
                {"item": ".NET 10 SDK", "detail": "Installed and on your PATH."},
                {"item": "A licence key", "detail": "Optional — output is watermarked without one."},
                {"item": "Word, Excel or PowerPoint", "detail": "To open the generated documents."},
                {"item": "The sample repository", "detail": "Cloned and building before we start."},
            ],
        },
        "resources": {
            "headline": "Where to go next",
            "items": [
                {"title": "Nutrient .NET SDK guides", "where": "nutrient.io/guides/dotnet"},
                {"title": "Office templating reference", "where": "The from-Word-template guide"},
                {"title": "PDF/UA and accessibility", "where": "nutrient.io/guides — accessibility"},
                {"title": "This demo's source", "where": "The repository you cloned"},
            ],
        },
    }

    write("training", slides, doc_title="Training Deck Template", model=model,
          meta={"order": 5, "title": "Training deck",
                "subtitle": "Six slides of outcomes, agenda, module detail and resources.",
                "features": ["Five repeating blocks", "Sections under dotted paths"]})


if __name__ == "__main__":
    print("PPTX templates:")
    qbr()
    kickoff()
    training()
