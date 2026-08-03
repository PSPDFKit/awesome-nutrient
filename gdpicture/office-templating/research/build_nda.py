#!/usr/bin/env python3
"""Mutual NDA — the inverted-section showcase.

The whole library had no `{{^flag}}` example (see TEMPLATE-PLAN.md), which an NDA
demonstrates naturally: an agreement is either mutual or one-way, and the recitals,
obligations and signature block all change accordingly. That's the same flag driving
`{{#mutual}}` in one place and `{{^mutual}}` in another.

Also shows nested sections: clauses, each with its own sub-clause list.
"""

from pathlib import Path

from ooxml import ACCENT, INK, MUTED, docx

OUT = (Path(__file__).resolve().parent.parent
       / "src" / "NutrientOfficeTemplating" / "Templates" / "nda.docx")

run, para, heading = docx.run, docx.para, docx.heading

body = []

# ---- Title
body.append(docx.title(
    "MUTUAL NON-DISCLOSURE AGREEMENT",
    sub_runs=[
        run("Reference ", sz=18, color=MUTED),
        run("{{agreementRef}}", sz=18, color=ACCENT),
        run("   ·   Effective ", sz=18, color=MUTED),
        run("{{effectiveDate}}", sz=18, color=ACCENT),
    ]))

# ---- Parties
body.append(heading("1.  Parties", before=0))
body.append(docx.two_column(
    [[run("DISCLOSING PARTY", b=True, sz=16, color=MUTED)],
     [run("{{partyA.name}}", b=True, sz=22, color=INK)],
     [run("{{partyA.entityType}}", sz=19)],
     [run("{{partyA.address}}", sz=19, color=MUTED)]],
    [[run("RECEIVING PARTY", b=True, sz=16, color=MUTED)],
     [run("{{partyB.name}}", b=True, sz=22, color=INK)],
     [run("{{partyB.entityType}}", sz=19)],
     [run("{{partyB.address}}", sz=19, color=MUTED)]]))
body.append(docx.spacer(240))

# ---- Recitals: the mutual/one-way switch.
# Both branches key off the same `mutual` flag, and each sits in a single paragraph —
# markers on their own lines would leave an empty paragraph behind once resolved.
body.append(heading("2.  Purpose"))
body.append(docx.section("mutual", [
    run("Each party wishes to disclose Confidential Information to the other for the "
        "purpose of ", sz=20),
    run("{{purpose}}", sz=20, b=True),
    run(". Each party may act as both Disclosing Party and Receiving Party under this "
        "Agreement, and the obligations below apply reciprocally.", sz=20),
], after=100))
body.append(docx.section("mutual", [
    run("The Disclosing Party wishes to disclose Confidential Information to the "
        "Receiving Party for the purpose of ", sz=20),
    run("{{purpose}}", sz=20, b=True),
    run(". The obligations below bind the Receiving Party alone.", sz=20),
], inverted=True, after=180))

# ---- Definition of confidential information — a one-paragraph repeat.
body.append(heading("3.  Confidential information"))
body.append(para([
    run("“Confidential Information” means any non-public information disclosed under "
        "this Agreement, including without limitation:", sz=20),
], after=100))
body.append(docx.section_lines("categories", [run("{{label}}", sz=20)],
                               bullet=True, after=60))
body.append(docx.spacer(180))

# ---- Obligations: nested sections.
#
# The outer section has to span both paragraphs — a heading *and* its own points list —
# so its markers can't be collapsed into one paragraph the way the others are. Tested:
# making them siblings breaks scoping (the headings ran together and the inner loop
# produced nothing). The inner loop is still collapsed, so only the outer pair costs a
# line, and `after=0` keeps that line tight.
body.append(heading("4.  Obligations of the receiving party"))
body.append(docx.section_open("obligations"))
body.append(para([run("{{heading}}", b=True, sz=20, color=INK)], after=60))
body.append(docx.section_lines("points", [run("{{text}}", sz=20)], bullet=True, after=60))
body.append(docx.section_close("obligations"))
body.append(docx.spacer(180))

# ---- Exclusions
body.append(heading("5.  Exclusions"))
body.append(para([
    run("The obligations in clause 4 do not apply to information that is or becomes "
        "publicly available through no breach of this Agreement, was rightfully known "
        "to the Receiving Party before disclosure, or is independently developed "
        "without reference to the Confidential Information.", sz=20),
], after=180))

# ---- Term
body.append(heading("6.  Term and return of materials"))
body.append(para([
    run("This Agreement takes effect on the Effective Date and continues for ", sz=20),
    run("{{termYears}}", sz=20, b=True),
    run(" years. The confidentiality obligations survive for a further ", sz=20),
    run("{{survivalYears}}", sz=20, b=True),
    run(" years after termination.", sz=20),
], after=100))

# A second, independent conditional — return of materials is often struck out.
body.append(docx.section("requiresReturn", [
    run("On written request, the Receiving Party will return or destroy all "
        "Confidential Information within ", sz=20),
    run("{{returnDays}}", sz=20, b=True),
    run(" days and confirm in writing that it has done so.", sz=20),
], after=180))

# ---- Notices: a table whose rows come from the data.
# Tables are the other place a loop has to live in the markup rather than a paragraph —
# the section opens in the row's first cell and closes in its last, so the <w:tr>
# repeats. Same pattern as the invoice fixture.
body.append(heading("7.  Notices"))
body.append(para([
    run("Notices under this Agreement are validly given when delivered to the "
        "addresses below.", sz=20),
], after=140))

NOTICE_W = [2000, 3200, 3400]
body.append(docx.table(
    [docx.header_row(["Party", "Contact", "Address for notices"], NOTICE_W),
     docx.loop_row("notices", [
         [run("{{party}}", sz=19, b=True, color=INK)],
         [run("{{contact}}", sz=19)],
         [run("{{address}}", sz=19, color=MUTED)],
     ], NOTICE_W)],
    NOTICE_W))
body.append(docx.spacer(240))

# ---- Governing law
body.append(heading("8.  Governing law"))
body.append(para([
    run("This Agreement is governed by the laws of ", sz=20),
    run("{{governingLaw}}", sz=20, b=True),
    run(", and the parties submit to the exclusive jurisdiction of the courts of ", sz=20),
    run("{{jurisdiction}}", sz=20, b=True),
    run(".", sz=20),
], after=240))

# ---- Signatures
body.append(heading("Signatures", before=240, after=200))
body.append(docx.signature_block(
    "{{partyA.signatory}}", "for {{partyA.name}}",
    "{{partyB.signatory}}", "for {{partyB.name}}"))

docx.write(OUT, body, doc_title="Mutual Non-Disclosure Agreement Template")
print(f"wrote {OUT.relative_to(Path(__file__).resolve().parent.parent)} "
      f"({OUT.stat().st_size} bytes)")
