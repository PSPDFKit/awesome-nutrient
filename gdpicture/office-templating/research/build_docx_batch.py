#!/usr/bin/env python3
"""Authors the remaining DOCX templates.

One function per document, all sharing research/ooxml/docx.py. Structures follow the
conventions in research/DOCUMENT-CONVENTIONS.md — section order and field names from real
documents rather than invented.

These reuse constructs the first two templates already proved; the point is breadth of
document type, not new engine coverage.
"""

import json
from pathlib import Path

from ooxml import ACCENT, INK, MUTED, POSITIVE, WARN, docx

TEMPLATES = (Path(__file__).resolve().parent.parent
             / "src" / "NutrientOfficeTemplating" / "Templates")

run, para, heading, section = docx.run, docx.para, docx.heading, docx.section
lines, spacer = docx.section_lines, docx.spacer


def write(name, body, *, doc_title, model, meta):
    """Writes the .docx, its model and its metadata sidecar together."""
    docx.write(TEMPLATES / f"{name}.docx", body, doc_title=doc_title)

    with open(TEMPLATES / f"{name}.model.json", "w", encoding="utf8") as f:
        json.dump({"config": {"delimiter": {"start": "{{", "end": "}}"}}, "model": model},
                  f, indent=4, ensure_ascii=False)
        f.write("\n")

    with open(TEMPLATES / f"{name}.meta.json", "w", encoding="utf8") as f:
        json.dump(meta, f, indent=4, ensure_ascii=False)
        f.write("\n")

    size = (TEMPLATES / f"{name}.docx").stat().st_size
    print(f"  {name}.docx ({size} bytes)")


# ------------------------------------------------------------------ offer letter

def offer_letter():
    """Employment offer letter.

    The at-will disclaimer is the canonical all-caps clause US offer letters carry.
    Non-compete is deliberately absent as a default: the FTC rule was vacated and
    removed from the CFR in Feb 2026, and California makes even attempting to enforce
    one a civil violation. See DOCUMENT-CONVENTIONS.md.
    """
    body = [
        para([run("{{%logo}}")], after=200),
        docx.title("OFFER OF EMPLOYMENT", sub_runs=[
            run("{{letterDate}}", sz=18, color=MUTED)]),

        para([run("{{candidate.name}}", b=True, sz=22, color=INK)], after=40),
        para([run("{{candidate.address}}", sz=19, color=MUTED)], after=240),

        para([run("Dear {{candidate.firstName}},", sz=20)], after=140),
        para([
            run("We are pleased to offer you the position of ", sz=20),
            run("{{position.title}}", sz=20, b=True),
            run(" at ", sz=20),
            run("{{employer.name}}", sz=20, b=True),
            run(", reporting to {{position.reportsTo}}. Your anticipated start date is ", sz=20),
            run("{{position.startDate}}", sz=20, b=True),
            run(".", sz=20),
        ], after=200),

        heading("1.  Compensation", before=0),
        docx.table(
            [docx.header_row(["Component", "Amount", "Notes"], [2600, 2400, 4000]),
             docx.loop_row("compensation", [
                 [run("{{component}}", sz=19, color=INK)],
                 [run("{{amount}}", sz=19, b=True)],
                 [run("{{note}}", sz=19, color=MUTED)],
             ], [2600, 2400, 4000])],
            [2600, 2400, 4000]),
        spacer(200),

        # Pay frequency rewrites the sentence, not just a label — real letters vary
        # between "semi-monthly payments of", "annualized base salary of", and hourly.
        para([
            run("Your base salary will be paid ", sz=20),
            run("{{position.payFrequency}}", sz=20, b=True),
            run(", less applicable withholdings and deductions.", sz=20),
        ], after=200),

        heading("2.  Benefits"),
        lines("benefits", [run("{{label}}", sz=20)], bullet=True, after=60),
        spacer(180),

        heading("3.  Contingencies"),
        para([run("This offer is conditioned upon the following:", sz=20)], after=100),
        lines("contingencies", [run("{{label}}", sz=20)], bullet=True, after=60),
        spacer(180),

        # Three independent conditionals — each clause appears only when its flag is set.
        section("hasSigningBonus", [
            run("You will receive a one-time signing bonus of ", sz=20),
            run("{{signingBonus.amount}}", sz=20, b=True),
            run(", payable with your first regular pay cheque and repayable in full if you "
                "resign within {{signingBonus.clawbackMonths}} months of your start date.", sz=20),
        ], after=140),

        section("hasRelocation", [
            run("The Company will reimburse documented relocation expenses up to ", sz=20),
            run("{{relocation.cap}}", sz=20, b=True),
            run(", subject to the repayment schedule in the enclosed relocation policy.", sz=20),
        ], after=140),

        section("needsSponsorship", [
            run("This offer is contingent on the Company's successful sponsorship of your ", sz=20),
            run("{{sponsorship.visaType}}", sz=20, b=True),
            run(" status.", sz=20),
        ], after=200),

        heading("4.  Employment at will"),
        # The canonical wording, all-caps as real letters print it.
        para([run("{{atWillNotice}}", sz=19)], after=140),
        para([run("{{notAContractNotice}}", sz=19, color=MUTED)], after=200),

        heading("5.  Acceptance"),
        para([
            run("Please confirm your acceptance by signing below and returning this letter by ", sz=20),
            run("{{offerExpiry}}", sz=20, b=True),
            run(".", sz=20),
        ], after=240),

        para([run("Sincerely,", sz=20)], after=200),
        docx.signature_block(
            "{{signatory.name}}", "{{signatory.title}}, {{employer.name}}",
            "{{candidate.name}}", "Accepted — date: ________________"),
    ]

    model = {
        "letterDate": "2026-08-14",
        "employer": {"name": "Nutrient GmbH"},
        "candidate": {
            "name": "Rowan Ellis",
            "firstName": "Rowan",
            "address": "48 Sonnenallee, 12045 Berlin, Germany",
        },
        "position": {
            "title": "Senior Solutions Engineer",
            "reportsTo": "Marta Feld, Director of Solutions Engineering",
            "startDate": "2026-09-28",
            "payFrequency": "in semi-monthly instalments",
        },
        "compensation": [
            {"component": "Annual base salary", "amount": "EUR 92,000",
             "note": "Reviewed annually each March."},
            {"component": "Target bonus", "amount": "12% of base",
             "note": "Against company and individual objectives."},
            {"component": "Equity grant", "amount": "4,000 options",
             "note": "Four-year vest, one-year cliff, then monthly."},
        ],
        "benefits": [
            {"label": "30 days of annual leave, prorated in your first calendar year."},
            {"label": "Statutory health insurance with employer contribution."},
            {"label": "Company pension scheme after six months of service."},
            {"label": "EUR 1,500 annual learning and conference budget."},
        ],
        "contingencies": [
            {"label": "Satisfactory completion of reference checks."},
            {"label": "Evidence of your right to work in Germany."},
            {"label": "Signature of the Company's confidentiality agreement."},
        ],
        "hasSigningBonus": True,
        "signingBonus": {"amount": "EUR 5,000", "clawbackMonths": "12"},
        "hasRelocation": True,
        "relocation": {"cap": "EUR 8,000"},
        "needsSponsorship": False,
        "sponsorship": {"visaType": "EU Blue Card"},
        "atWillNotice": (
            "YOUR EMPLOYMENT WITH THE COMPANY IS FOR NO SPECIFIED PERIOD AND CONSTITUTES "
            "AT-WILL EMPLOYMENT. EITHER YOU OR THE COMPANY MAY TERMINATE THE EMPLOYMENT "
            "RELATIONSHIP AT ANY TIME, WITH OR WITHOUT CAUSE AND WITH OR WITHOUT ADVANCE "
            "NOTICE."),
        "notAContractNotice": (
            "This letter is not a contract of employment for any specific duration, and "
            "supersedes all prior representations, whether written or oral, including any "
            "made during recruitment."),
        "offerExpiry": "2026-08-28",
        "signatory": {"name": "Marta Feld", "title": "Director, Solutions Engineering"},
        "logo": _logo("Nutrient logo", "Employer letterhead mark"),
    }

    write("offer-letter", body,
          doc_title="Employment Offer Letter Template",
          model=model,
          meta={"order": 3, "title": "Offer letter",
                "subtitle": "Compensation table, benefits list, and three optional clauses.",
                "features": ["Compensation table", "Three conditionals", "Bulleted lists"]})


# ------------------------------------------------------------------ statement of work

def statement_of_work():
    """Statement of work, commercial MSA-subordinate form.

    Federal SOWs express due dates as *offsets* rather than absolute dates — "10 WD ARC"
    is ten government workdays after receipt of comments. Distinctive enough to reproduce.
    """
    body = [
        docx.title("STATEMENT OF WORK", sub_runs=[
            run("SOW ", sz=18, color=MUTED), run("{{sowNo}}", sz=18, color=ACCENT),
            run("   ·   Revision ", sz=18, color=MUTED), run("{{revision}}", sz=18, color=ACCENT),
            run("   ·   ", sz=18, color=MUTED), run("{{sowDate}}", sz=18, color=MUTED)]),

        para([
            run("This Statement of Work is issued under the Master Services Agreement "
                "between the parties dated ", sz=20),
            run("{{msaDate}}", sz=20, b=True),
            run(" and is governed by its terms. Where this document and the Agreement "
                "conflict, the Agreement prevails.", sz=20),
        ], after=200),

        heading("1.  Parties and contacts", before=0),
        docx.two_column(
            [[run("SUPPLIER", b=True, sz=16, color=MUTED)],
             [run("{{supplier.name}}", b=True, sz=22, color=INK)],
             [run("{{supplier.contact}}", sz=19)],
             [run("{{supplier.email}}", sz=19, color=MUTED)]],
            [[run("CLIENT", b=True, sz=16, color=MUTED)],
             [run("{{client.name}}", b=True, sz=22, color=INK)],
             [run("{{client.contact}}", sz=19)],
             [run("{{client.email}}", sz=19, color=MUTED)]]),
        spacer(240),

        heading("2.  Objectives"),
        lines("objectives", [run("{{label}}", sz=20)], bullet=True, after=60),
        spacer(180),

        heading("3.  Deliverables"),
        para([
            run("Due dates are expressed as offsets: ", sz=19, color=MUTED),
            run("CD", sz=19, b=True), run(" calendar days, ", sz=19, color=MUTED),
            run("WD", sz=19, b=True), run(" workdays, ", sz=19, color=MUTED),
            run("ARC", sz=19, b=True), run(" after receipt of comments, ", sz=19, color=MUTED),
            run("DD", sz=19, b=True), run(" from the task-order date.", sz=19, color=MUTED),
        ], after=140),
        docx.table(
            [docx.header_row(["ID", "Deliverable", "Format", "Due", "Acceptance"],
                             [700, 3400, 1500, 1400, 2000]),
             docx.loop_row("deliverables", [
                 [run("{{id}}", sz=19, color=MUTED)],
                 [run("{{name}}", sz=19, color=INK)],
                 [run("{{format}}", sz=19)],
                 [run("{{due}}", sz=19, b=True)],
                 [run("{{acceptance}}", sz=19, color=MUTED)],
             ], [700, 3400, 1500, 1400, 2000])],
            [700, 3400, 1500, 1400, 2000]),
        spacer(240),

        heading("4.  Milestones and payment"),
        docx.table(
            [docx.header_row(["Milestone", "Completion", "Trigger", "Amount"],
                             [3200, 1600, 2800, 1400]),
             docx.loop_row("milestones", [
                 [run("{{name}}", sz=19, color=INK)],
                 [run("{{completion}}", sz=19)],
                 [run("{{trigger}}", sz=19, color=MUTED)],
                 [run("{{amount}}", sz=19, b=True)],
             ], [3200, 1600, 2800, 1400])],
            [3200, 1600, 2800, 1400]),
        spacer(240),

        heading("5.  Assumptions"),
        para([
            run("This Statement of Work is priced on the assumptions below. If any proves "
                "incorrect, the change-control process in clause 8 applies.", sz=20),
        ], after=100),
        lines("assumptions", [run("{{label}}", sz=20)], bullet=True, after=60),
        spacer(180),

        heading("6.  Client responsibilities"),
        docx.table(
            [docx.header_row(["#", "Responsibility", "Owner", "Required by"],
                             [600, 4600, 2000, 1800]),
             docx.loop_row("clientObligations", [
                 [run("{{ref}}", sz=19, color=MUTED)],
                 [run("{{label}}", sz=19)],
                 [run("{{owner}}", sz=19)],
                 [run("{{requiredBy}}", sz=19, color=MUTED)],
             ], [600, 4600, 2000, 1800])],
            [600, 4600, 2000, 1800]),
        spacer(240),

        heading("7.  Acceptance"),
        para([
            run("The Client will review each deliverable within ", sz=20),
            run("{{acceptanceDays}}", sz=20, b=True),
            run(" business days and either accept it or provide written detail of any "
                "deficiency. A deliverable not rejected within that period is deemed "
                "accepted.", sz=20),
        ], after=200),

        heading("8.  Change control"),
        para([
            run("Any change to scope, schedule or price takes effect only when a written "
                "change order is signed by both parties.", sz=20),
        ], after=200),

        # Only present for time-and-materials engagements.
        section("isTimeAndMaterials", [
            run("Amounts stated for time-and-materials work are estimates, not a fixed "
                "price. The Supplier will notify the Client on reaching 80% of the "
                "not-to-exceed amount of ", sz=20),
            run("{{notToExceed}}", sz=20, b=True),
            run(".", sz=20),
        ], after=240),

        heading("Signatures", before=240, after=200),
        docx.signature_block(
            "{{supplier.signatory}}", "for {{supplier.name}}",
            "{{client.signatory}}", "for {{client.name}}"),
    ]

    model = {
        "sowNo": "SOW-2026-014",
        "revision": "1.0",
        "sowDate": "2026-08-20",
        "msaDate": "2025-04-02",
        "supplier": {"name": "Nutrient GmbH", "contact": "Marta Feld, Engagement Lead",
                     "email": "delivery@nutrient.io", "signatory": "Marta Feld"},
        "client": {"name": "Acme Corporation", "contact": "Dana Whitfield, VP Operations",
                   "email": "dana.whitfield@acme.example", "signatory": "Dana Whitfield"},
        "objectives": [
            {"label": "Replace the manual document assembly process with templated generation."},
            {"label": "Produce accessible PDF output meeting PDF/UA-1 conformance."},
            {"label": "Hand over authoring documentation the Client's team can maintain."},
        ],
        "deliverables": [
            {"id": "D1", "name": "Discovery report and technical audit", "format": "PDF",
             "due": "15 CD DD", "acceptance": "Client sign-off"},
            {"id": "D2", "name": "Template set — Word, Excel, PowerPoint", "format": "OOXML",
             "due": "10 WD ARC", "acceptance": "Renders without placeholders"},
            {"id": "D3", "name": "Generation service and API", "format": "Source + container",
             "due": "45 CD DD", "acceptance": "Passes acceptance suite"},
            {"id": "D4", "name": "Authoring guide and training", "format": "PDF + session",
             "due": "5 WD ARF", "acceptance": "Session delivered"},
        ],
        "milestones": [
            {"name": "Discovery complete", "completion": "2026-09-11",
             "trigger": "Acceptance of D1", "amount": "6,000"},
            {"name": "Templates delivered", "completion": "2026-10-02",
             "trigger": "Acceptance of D2", "amount": "11,000"},
            {"name": "Service in production", "completion": "2026-10-30",
             "trigger": "Acceptance of D3", "amount": "18,000"},
            {"name": "Handover", "completion": "2026-11-13",
             "trigger": "Acceptance of D4", "amount": "5,000"},
        ],
        "assumptions": [
            {"label": "The Client provides sample documents within five days of kick-off."},
            {"label": "One review cycle per deliverable is included; further cycles are chargeable."},
            {"label": "Work is performed remotely; on-site visits are billed separately."},
        ],
        "clientObligations": [
            {"ref": "1", "label": "Nominate a single decision-maker for acceptance",
             "owner": "VP Operations", "requiredBy": "Kick-off"},
            {"ref": "2", "label": "Provide access to the document repository",
             "owner": "IT Operations", "requiredBy": "Week 1"},
            {"ref": "3", "label": "Supply brand assets and font licences",
             "owner": "Marketing", "requiredBy": "Week 2"},
        ],
        "acceptanceDays": "10",
        "isTimeAndMaterials": False,
        "notToExceed": "EUR 60,000",
    }

    write("sow", body,
          doc_title="Statement of Work Template",
          model=model,
          meta={"order": 4, "title": "Statement of work",
                "subtitle": "Three tables — deliverables, milestones and client obligations.",
                "features": ["Three row loops", "Offset due dates", "Conditional pricing clause"]})


# ------------------------------------------------------------------ status report

def status_report():
    """Project status report, following California CDT ITPL 10-07.

    The RAG thresholds are that document's actual numbers: green under 5% variance,
    amber 5–10%, red over 10%.
    """
    body = [
        docx.title("PROJECT STATUS REPORT", sub_runs=[
            run("{{project.name}}", sz=18, color=ACCENT),
            run("   ·   ", sz=18, color=MUTED),
            run("{{period.start}} to {{period.end}}", sz=18, color=MUTED)]),

        docx.table(
            [docx.header_row(["Project ID", "Phase", "Criticality", "Overall status"],
                             [2200, 2600, 2200, 2400]),
             docx.row([
                 docx.cell([run("{{project.id}}", sz=19)], w=2200),
                 docx.cell([run("{{project.phase}}", sz=19)], w=2600),
                 docx.cell([run("{{project.criticality}}", sz=19)], w=2200),
                 docx.cell([run("{{project.status}}", sz=19, b=True, color=ACCENT)], w=2400),
             ])],
            [2200, 2600, 2200, 2400]),
        spacer(200),

        para([
            run("Percent complete ", sz=19, color=MUTED),
            run("{{project.percentComplete}}", sz=19, b=True),
            run("   ·   Prepared by ", sz=19, color=MUTED),
            run("{{project.preparedBy}}", sz=19),
            run("   ·   Sponsor ", sz=19, color=MUTED),
            run("{{project.sponsor}}", sz=19),
        ], after=240),

        heading("1.  Summary", before=0),
        para([run("{{summary}}", sz=20)], after=200),

        heading("2.  Accomplishments this period"),
        lines("accomplishments", [run("{{label}}", sz=20)], bullet=True, after=60),
        spacer(180),

        heading("3.  Variances"),
        para([
            run("Status thresholds: green under 5% variance, amber 5–10%, red above 10%.",
                sz=19, color=MUTED),
        ], after=140),
        docx.table(
            [docx.header_row(["Dimension", "Planned", "Actual", "Variance", "Status"],
                             [2600, 1700, 1700, 1500, 1500]),
             docx.loop_row("variances", [
                 [run("{{dimension}}", sz=19, color=INK)],
                 [run("{{planned}}", sz=19)],
                 [run("{{actual}}", sz=19)],
                 [run("{{variance}}", sz=19, b=True)],
                 [run("{{status}}", sz=19)],
             ], [2600, 1700, 1700, 1500, 1500])],
            [2600, 1700, 1700, 1500, 1500]),
        spacer(240),

        heading("4.  Milestones"),
        docx.table(
            [docx.header_row(["Milestone", "Target", "Forecast", "Status"],
                             [4000, 1700, 1700, 1600]),
             docx.loop_row("milestones", [
                 [run("{{name}}", sz=19, color=INK)],
                 [run("{{target}}", sz=19)],
                 [run("{{forecast}}", sz=19)],
                 [run("{{status}}", sz=19, color=MUTED)],
             ], [4000, 1700, 1700, 1600])],
            [4000, 1700, 1700, 1600]),
        spacer(240),

        heading("5.  Risks"),
        docx.table(
            [docx.header_row(["ID", "Risk", "Probability", "Impact", "Mitigation", "Owner"],
                             [600, 2900, 1300, 1200, 2400, 1400]),
             docx.loop_row("risks", [
                 [run("{{id}}", sz=19, color=MUTED)],
                 [run("{{description}}", sz=19)],
                 [run("{{probability}}", sz=19)],
                 [run("{{impact}}", sz=19)],
                 [run("{{mitigation}}", sz=19, color=MUTED)],
                 [run("{{owner}}", sz=19)],
             ], [600, 2900, 1300, 1200, 2400, 1400])],
            [600, 2900, 1300, 1200, 2400, 1400]),
        spacer(240),

        heading("6.  Decisions required"),
        # The list when there are decisions, and an explicit note when there aren't —
        # both keyed off the same collection. The note has to live *inside* the inverted
        # section, not after it, or it prints unconditionally.
        lines("decisions", [run("{{label}}", sz=20)], bullet=True, after=60),
        section("decisions", [run("{{noDecisionsNote}}", sz=20, color=MUTED)],
                inverted=True, after=200),

        heading("7.  Look ahead"),
        lines("lookAhead", [run("{{label}}", sz=20)], bullet=True, after=60),
    ]

    model = {
        "project": {
            "name": "Document generation programme",
            "id": "PRJ-2026-031",
            "phase": "Implementation",
            "criticality": "Medium",
            "status": "Amber",
            "percentComplete": "62%",
            "preparedBy": "Jordan Reyes",
            "sponsor": "Dana Whitfield",
        },
        "period": {"start": "2026-07-01", "end": "2026-07-31"},
        "summary": (
            "Template authoring is complete for all three formats and the generation "
            "service is running in staging. Schedule slipped by six working days against "
            "a plan of ninety, driven by the accessibility rework described below; the "
            "recovery plan brings delivery back to the baseline date."),
        "accomplishments": [
            {"label": "All twelve templates authored and reviewed."},
            {"label": "Generation service deployed to staging behind a feature flag."},
            {"label": "PDF/UA conformance verified on the first six outputs."},
        ],
        "variances": [
            {"dimension": "Schedule", "planned": "90 days", "actual": "96 days",
             "variance": "6.7%", "status": "Amber"},
            {"dimension": "One-time cost", "planned": "40,000", "actual": "41,200",
             "variance": "3.0%", "status": "Green"},
            {"dimension": "Deliverables", "planned": "12", "actual": "12",
             "variance": "0%", "status": "Green"},
            {"dimension": "Resources", "planned": "3.0 FTE", "actual": "3.4 FTE",
             "variance": "13.3%", "status": "Red"},
        ],
        "milestones": [
            {"name": "Templates authored", "target": "2026-07-10",
             "forecast": "2026-07-10", "status": "Complete"},
            {"name": "Service in staging", "target": "2026-07-24",
             "forecast": "2026-07-31", "status": "Complete, late"},
            {"name": "Accessibility audit", "target": "2026-08-14",
             "forecast": "2026-08-21", "status": "At risk"},
            {"name": "Production release", "target": "2026-09-04",
             "forecast": "2026-09-04", "status": "On target"},
        ],
        "risks": [
            {"id": "R1", "description": "Font licensing unresolved for the container image",
             "probability": "Medium", "impact": "High",
             "mitigation": "Legal review booked for week 32", "owner": "Legal"},
            {"id": "R2", "description": "Accessibility rework may extend into the audit window",
             "probability": "High", "impact": "Medium",
             "mitigation": "Second reviewer added", "owner": "Engineering"},
        ],
        "decisions": [
            {"label": "Approve 0.4 FTE of additional engineering capacity to hold the release date."},
            {"label": "Confirm whether the Q4 formats are in scope for this phase or the next."},
        ],
        "noDecisionsNote": "No decisions are required this period; the report is for visibility.",
        "lookAhead": [
            {"label": "Complete the accessibility audit and remediate findings."},
            {"label": "Run the production readiness review."},
            {"label": "Begin authoring the Q4 template set."},
        ],
    }

    write("status-report", body,
          doc_title="Project Status Report Template",
          model=model,
          meta={"order": 5, "title": "Status report",
                "subtitle": "RAG status, variance table, milestones and a risk register.",
                "features": ["Four row loops", "Inverted section", "Status summary table"]})


# ------------------------------------------------------------------ meeting minutes

def meeting_minutes():
    """Meeting minutes — attendees, decisions, and actions with owners."""
    body = [
        docx.title("MEETING MINUTES", sub_runs=[
            run("{{meeting.title}}", sz=18, color=ACCENT),
            run("   ·   ", sz=18, color=MUTED),
            run("{{meeting.date}}", sz=18, color=MUTED)]),

        docx.two_column(
            [[run("DATE AND TIME", b=True, sz=16, color=MUTED)],
             [run("{{meeting.date}}, {{meeting.time}}", sz=19)],
             [run("LOCATION", b=True, sz=16, color=MUTED)],
             [run("{{meeting.location}}", sz=19)]],
            [[run("CHAIR", b=True, sz=16, color=MUTED)],
             [run("{{meeting.chair}}", sz=19)],
             [run("MINUTED BY", b=True, sz=16, color=MUTED)],
             [run("{{meeting.scribe}}", sz=19)]]),
        spacer(240),

        heading("1.  Attendance", before=0),
        docx.table(
            [docx.header_row(["Name", "Role", "Attendance"], [3400, 3600, 2000]),
             docx.loop_row("attendees", [
                 [run("{{name}}", sz=19, color=INK)],
                 [run("{{role}}", sz=19)],
                 [run("{{attendance}}", sz=19, color=MUTED)],
             ], [3400, 3600, 2000])],
            [3400, 3600, 2000]),
        spacer(240),

        heading("2.  Agenda and discussion"),
        docx.section_open("items"),
        para([run("{{title}}", b=True, sz=20, color=INK)], after=60),
        para([run("{{discussion}}", sz=20)], after=100),
        docx.section_close("items"),
        spacer(180),

        heading("3.  Decisions"),
        docx.table(
            [docx.header_row(["#", "Decision", "Rationale"], [600, 4400, 4000]),
             docx.loop_row("decisions", [
                 [run("{{ref}}", sz=19, color=MUTED)],
                 [run("{{decision}}", sz=19, color=INK)],
                 [run("{{rationale}}", sz=19, color=MUTED)],
             ], [600, 4400, 4000])],
            [600, 4400, 4000]),
        spacer(240),

        heading("4.  Actions"),
        docx.table(
            [docx.header_row(["#", "Action", "Owner", "Due"], [600, 4600, 2200, 1600]),
             docx.loop_row("actions", [
                 [run("{{ref}}", sz=19, color=MUTED)],
                 [run("{{action}}", sz=19)],
                 [run("{{owner}}", sz=19, b=True)],
                 [run("{{due}}", sz=19)],
             ], [600, 4600, 2200, 1600])],
            [600, 4600, 2200, 1600]),
        spacer(240),

        section("hasNextMeeting", [
            run("Next meeting: ", sz=20, color=MUTED),
            run("{{nextMeeting}}", sz=20, b=True),
        ], after=200),
    ]

    model = {
        "meeting": {
            "title": "Document generation programme — weekly review",
            "date": "2026-08-05",
            "time": "10:00–11:00 CEST",
            "location": "Berlin office, room 3.2 and video",
            "chair": "Dana Whitfield",
            "scribe": "Jordan Reyes",
        },
        "attendees": [
            {"name": "Dana Whitfield", "role": "VP Operations (chair)", "attendance": "Present"},
            {"name": "Marta Feld", "role": "Director, Solutions Engineering", "attendance": "Present"},
            {"name": "Jordan Reyes", "role": "Solutions Engineer", "attendance": "Present"},
            {"name": "Tomas Brandt", "role": "Platform lead", "attendance": "Apologies"},
        ],
        "items": [
            {"title": "1.1  Template authoring status",
             "discussion": "All twelve templates are authored. Two required rework after the "
                           "accessibility review; both are now passing. No further authoring "
                           "work is expected this phase."},
            {"title": "1.2  Container font licensing",
             "discussion": "The Microsoft core fonts package is required for faithful "
                           "Office-to-PDF conversion. Legal are reviewing redistribution terms "
                           "for the container image and will report back in week 32."},
            {"title": "1.3  Release readiness",
             "discussion": "Staging has been stable for eleven days. The group agreed to hold "
                           "the production date and add reviewer capacity rather than reduce "
                           "the accessibility scope."},
        ],
        "decisions": [
            {"ref": "D1", "decision": "Hold the 4 September production date",
             "rationale": "Slippage is recoverable with additional review capacity."},
            {"ref": "D2", "decision": "Add 0.4 FTE to the accessibility workstream",
             "rationale": "Cheaper than a delayed release; funded from the phase contingency."},
        ],
        "actions": [
            {"ref": "A1", "action": "Confirm font redistribution terms for the container",
             "owner": "Legal", "due": "2026-08-12"},
            {"ref": "A2", "action": "Book the production readiness review",
             "owner": "Jordan Reyes", "due": "2026-08-14"},
            {"ref": "A3", "action": "Circulate the Q4 template shortlist",
             "owner": "Marta Feld", "due": "2026-08-19"},
        ],
        "hasNextMeeting": True,
        "nextMeeting": "2026-08-12, 10:00 CEST",
    }

    write("meeting-minutes", body,
          doc_title="Meeting Minutes Template",
          model=model,
          meta={"order": 6, "title": "Meeting minutes",
                "subtitle": "Attendance, discussion, decisions and actions with owners.",
                "features": ["Four row loops", "Multi-paragraph section", "Conditional footer"]})


def _logo(alt, title):
    """The Nutrient dot mark, shared by the letterhead templates."""
    import base64
    path = Path("/private/tmp/claude-502/-Users-mdjekic-Projects-Nutrient-Office-Templating-DEMO"
                "/2b1d9898-7a9b-48af-b4a9-bb1190de0641/scratchpad/logo.png")
    if not path.exists():
        # Fall back to the payload already committed in the contract's model.
        existing = json.loads((TEMPLATES / "contract.model.json").read_text())
        data = existing["model"]["logo"]["data"]
    else:
        data = base64.b64encode(path.read_bytes()).decode()

    return {
        "_type": "image", "source": "base64", "format": "png", "data": data,
        "width": 64, "height": 64,
        "altText": alt, "title": title,
        "borderColor": "F25E45", "borderWidth": 1, "borderStyle": "Solid",
    }


if __name__ == "__main__":
    print("DOCX templates:")
    offer_letter()
    statement_of_work()
    status_report()
    meeting_minutes()
