# Document conventions — research notes

Structures and field names for the remaining templates, from primary sources: SEC EDGAR
exhibits (NDA, offer letter), California CDT ITPL 10-07 (status report), IRS TIPSS-3 (SOW),
IRS/GSA/DOL regulation (expenses, timesheet), municipal and university budget forms, and
Sequoia / YC / 500 Global / Cooley / DocSend (pitch deck).

Full agent notes are in the task transcript; this file keeps what changes what we build.

## Five traps that would produce wrong-looking documents

1. **The 2026 IRS mileage rate splits mid-year.** Notice 2026-10 set 72.5¢, then the IRS
   revised it for fuel prices: **72.5¢ for Jan 1–Jun 30, 76.0¢ from Jul 1**. A single constant
   is wrong for half the year. Our expense report currently hardcodes 72.5¢ — correct for its
   July period, but the rate belongs in the data, not the prose.
2. **The $75 receipt threshold excludes lodging.** §1.274-5(c)(2)(iii) requires documentary
   evidence for *any* lodging expenditure regardless of amount, plus anything ≥ $75. Most
   templates state the threshold without the carve-out.
3. **Budget variance inverts between expense and revenue rows.** Expenses:
   `Budget − Actual − Encumbrance`. Revenue: `Actual − Budget`. The operand order reverses so
   "positive = favourable" holds for both, so a row needs a `type: expense|revenue` flag rather
   than one global formula. Called out as the most common modelling error in budget templates.
4. **FLSA overtime is weekly only** — >40 hrs at 1.5×, no federal daily OT. So a biweekly or
   monthly timesheet must carry an internal weekly boundary for the 40-hour test to compute.
   (California adds daily rules: 1.5× over 8, 2× over 12.)
5. **Pitch decks are sections, not slides.** YC's rule: every slide except the title is "the
   first slide of a set", n ≤ 3. That's how "10 slides" (Sequoia) and "19–20 pages" (DocSend)
   coexist.

## Two toggles that rewrite prose, not labels

Both are template *variants*, not fields:

- **NDA mutual vs one-way** changes the role vocabulary (Discloser/Recipient vs
  Disclosing/Receiving Party — each real filing picks a different pair), recital symmetry, and
  the signature-block count. Our NDA does this correctly with paired `{{#mutual}}` /
  `{{^mutual}}` blocks; worth noting it's the genuine convention, not a contrivance.
- **Offer letter `Pay Frequency`** rewrites the salary sentence: real letters vary between
  "semi-monthly payments of your annual base salary of $250,000", "annualized base salary of
  $220,000.00", and "$X per hour or approximately $Y per year".

## Corrections to my template plan

- **Offer letter — drop the non-compete as a default.** The FTC rule is dead: vacated
  nationwide (*Ryan LLC v. FTC*, 2024), and 16 CFR part 910 was removed from the CFR effective
  **12 Feb 2026**. California goes further — §16600.1/§16600.5 make it a civil violation to
  *enter into or attempt to enforce*, with a private right of action extending to prospective
  employees. Non-compete must be an off-by-default, jurisdiction-gated conditional.
- **Offer letter — salary range is optional, not required.** ~18 states plus DC have pay
  transparency laws, but they attach to *job postings* and disclosure on request. No verified
  requirement applies to the offer letter document itself.
- **Pitch deck — no securities disclaimers.** Sequoia, YC, 500 Global, a16z, Techstars and
  **Cooley's own published deck** contain none. The PSLRA safe harbour is a public-company
  regime; a "safe harbor" label on a seed deck would be misleading. The one well-attested
  marking is the cover-page legend:
  `Confidential and Proprietary. Copyright (c) by [Company]. All Rights Reserved.`
- **Pitch deck — no exit/comparables slide.** Listed as a red flag that pushes VCs to pass;
  no accelerator primary source includes one.
- **QBR — internal and customer-facing are two different decks**, not one with a flag. They
  share only title, exec summary, misses, asks and appendix. Internal anchors on quota and
  pipeline; customer-facing on health score and value realisation, and must *not* show quota,
  coverage ratio, win rate or churn forecasts.
- **QBR — add "Risks & mitigations" and "Decisions required".** The latter is described as the
  most-emphasised and most-omitted slide: "the reason meetings feel pointless."
- **Timesheet — no exempt/non-exempt checkbox.** No state or university form examined has one;
  classification is encoded by *form scope* ("Time Sheet (Biweekly) for Nonexempt Employees").
  Model it as template selection, not a field.
- **Timesheet — don't hardcode Mon–Sun.** Oklahoma and Utah both run Saturday–Friday weeks.
- **Timesheet — the meal break often isn't its own column pair.** DOL's own sample gives each
  day two In/Out pairs, the gap between them being the meal.
- **Budget — don't scale to thousands.** Not found in any departmental-level source; that's a
  consolidated/CAFR convention. Municipal and state forms report to whole dollars or cents.
- **Status report — cadence follows criticality**, which is directly encodable:
  High → monthly, Medium → quarterly, Low → semi-annual.

## Concrete figures worth using

**Status report RAG (California CDT):** variance Green <5%, Yellow 5–10%, Red >10%. Aggregate
score → Green 0–8, Yellow 9–19, Red 20+. Note CDT says *Yellow*; PMI/commercial practice says
*Amber*.

**GSA FY2026 per diem** (Oct 2025–Sep 2026): standard CONUS lodging $110, M&IE $68, tiers
$68–$92. First and last travel day at 75%. Lodging taxes are *not* in the CONUS rate.

**SOW federal due dates are offsets, not absolute** — a genuinely distinctive convention worth
reproducing: `ARC` after receipt of comments, `ARD` after receipt of draft, `CD` calendar day,
`WD` government workday, `DD` task-order date. Cells read `10 WD ARC`, `30 CD DD`.

**Variance thresholds in real policy:** UMass Boston "exceeding +/- $10,000 **and** 10%" (AND,
not OR); CA Dept of Finance "$1 million AND 10%" with a zero-denominator carve-out; Oregon
"$10,000 **or** 10 percent, whichever is greater". GFOA recommends the process but sets no
number.

**Pitch deck section convergence** — present in every source: Problem, Solution, Market, Team,
Business model, Competition. Present in all raise-oriented sources but absent from Sequoia:
The Ask. Weakest consensus: Why now?, Vision. DocSend's empirical finding: VCs spend longest on
Business model (64s) and Product (59s), and **80% more time** on the traction of companies that
*failed* to raise — scrutiny, not interest.

## Source caveats worth carrying

- SEC EDGAR rejects plain fetchers (403 without a declared User-Agent); NDA and offer-letter
  content was read directly and is reliable.
- **Commercial SOW clause wordings are conventional composites, not verbatim quotes** — the
  NITAAC templates and SEC MSA exhibits returned 403.
- The DocSend table and YC quotes are one degree removed from direct fetch (blog 403,
  JS-rendered library).
- Two timesheet attestation strings (Auburn, UC Irvine) came from search snippets after
  404/403 — verify before treating as verbatim.
- The CDT document is from 2010 and several form templates date to 2006–2016. Their *structure
  and disclaimer wording* remain standard; the compliance figures above are the current layer.
