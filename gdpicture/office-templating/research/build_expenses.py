#!/usr/bin/env python3
"""Expense report — the multiple-independent-loops showcase (XLSX).

Two unrelated row loops in one sheet: itemised expenses, and mileage claimed at the IRS
standard rate. Nothing in the library had more than one loop per document.

The mileage rate is the real IRS 2026 business standard rate of 72.5 cents per mile:
https://www.irs.gov/newsroom/irs-sets-2026-business-standard-mileage-rate-at-725-cents-per-mile-up-25-cents
"""

from pathlib import Path

from ooxml import xlsx

OUT = (Path(__file__).resolve().parent.parent
       / "src" / "NutrientOfficeTemplating" / "Templates" / "expenses.xlsx")

S = xlsx.Sheet
sheet = S("Expense report")

# Column widths, in characters. B is the label gutter, C-G the data.
for col, chars in {1: 3, 2: 22, 3: 30, 4: 12, 5: 12, 6: 12, 7: 14}.items():
    sheet.width(col, chars)

# ---- Title block
sheet.text(1, 2, "EXPENSE REPORT", S.TITLE)
sheet.height(1, 34)
sheet.merge(1, 2, 1, 3)

sheet.text(3, 2, "Employee", S.LABEL)
sheet.text(3, 3, "{{employee.name}}", S.BOLD)
sheet.text(3, 6, "Report no.", S.LABEL)
sheet.text(3, 7, "{{reportNo}}", S.PLAIN)

sheet.text(4, 2, "Employee ID", S.LABEL)
sheet.text(4, 3, "{{employee.id}}", S.PLAIN)
sheet.text(4, 6, "Period from", S.LABEL)
sheet.text(4, 7, "{{periodStart}}", S.PLAIN)

sheet.text(5, 2, "Department", S.LABEL)
sheet.text(5, 3, "{{employee.department}}", S.PLAIN)
sheet.text(5, 6, "Period to", S.LABEL)
sheet.text(5, 7, "{{periodEnd}}", S.PLAIN)

sheet.text(6, 2, "Cost centre", S.LABEL)
sheet.text(6, 3, "{{employee.costCentre}}", S.PLAIN)
sheet.text(6, 6, "Currency", S.LABEL)
sheet.text(6, 7, "{{currency}}", S.PLAIN)

# ---- Loop 1: itemised expenses.
# The loop opens in the first cell of the row and closes in the last, so the whole row
# repeats — the same pattern the Nutrient invoice fixture uses.
sheet.text(8, 2, "Itemised expenses", S.BOLD)

for col, label in zip(range(2, 8),
                      ["Date", "Description", "Category", "Payment", "Receipt", "Amount"]):
    sheet.text(9, col, label, S.HEADER)
sheet.height(9, 20)

sheet.text(10, 2, "{{#expenses}}{{date}}", S.PLAIN)
sheet.text(10, 3, "{{description}}", S.PLAIN)
sheet.text(10, 4, "{{category}}", S.PLAIN)
sheet.text(10, 5, "{{paymentMethod}}", S.PLAIN)
sheet.text(10, 6, "{{receipt}}", S.PLAIN)
sheet.text(10, 7, "{{amount}}{{/expenses}}", S.MONEY)

sheet.text(11, 6, "Subtotal, expenses", S.LABEL)
sheet.text(11, 7, "{{expensesSubtotal}}", S.MONEY_BOLD)

# ---- Loop 2: mileage, at a published statutory rate.
sheet.text(13, 2, "Mileage", S.BOLD)
# The rate is per row, not stated once here: the IRS 2026 standard business rate changes
# mid-year (72.5¢ to 1 Jun 30, then 76.0¢), so a single asserted rate is wrong for half
# the year. See research/DOCUMENT-CONVENTIONS.md.
sheet.text(13, 3, "{{mileageBasis}}", S.LABEL)

for col, label in zip(range(2, 8),
                      ["Date", "From / to", "Purpose", "Miles", "Rate", "Amount"]):
    sheet.text(14, col, label, S.HEADER)
sheet.height(14, 20)

sheet.text(15, 2, "{{#mileage}}{{date}}", S.PLAIN)
sheet.text(15, 3, "{{route}}", S.PLAIN)
sheet.text(15, 4, "{{purpose}}", S.PLAIN)
sheet.text(15, 5, "{{miles}}", S.NUMBER)
sheet.text(15, 6, "{{rate}}", S.PLAIN)
sheet.text(15, 7, "{{amount}}{{/mileage}}", S.MONEY)

sheet.text(16, 6, "Subtotal, mileage", S.LABEL)
sheet.text(16, 7, "{{mileageSubtotal}}", S.MONEY_BOLD)

# ---- Totals
sheet.text(18, 6, "Total claimed", S.BOLD)
sheet.text(18, 7, "{{totalClaimed}}", S.MONEY_BOLD)

sheet.text(19, 6, "Less advance", S.LABEL)
sheet.text(19, 7, "{{advance}}", S.MONEY)

sheet.text(20, 6, "Due to employee", S.BOLD)
sheet.text(20, 7, "{{dueToEmployee}}", S.ACCENT_BOLD)

# ---- Approval
sheet.text(23, 2, "Approval", S.BOLD)
sheet.text(25, 2, "Submitted by", S.LABEL)
sheet.text(25, 3, "{{employee.name}}", S.PLAIN)
sheet.text(25, 6, "Date", S.LABEL)
sheet.text(25, 7, "{{submittedDate}}", S.PLAIN)

sheet.text(26, 2, "Approved by", S.LABEL)
sheet.text(26, 3, "{{approver.name}}", S.PLAIN)
sheet.text(26, 6, "Date", S.LABEL)
sheet.text(26, 7, "{{approver.date}}", S.PLAIN)

sheet.text(27, 2, "Title", S.LABEL)
sheet.text(27, 3, "{{approver.title}}", S.PLAIN)

sheet.text(29, 2, "{{notes}}", S.WRAP)
sheet.merge(29, 2, 29, 7)

# The substantiation footnote real forms carry. The lodging carve-out is the part most
# templates get wrong: §1.274-5(c)(2)(iii) requires a receipt for *any* lodging
# expenditure regardless of amount, as well as anything at or above the threshold.
sheet.text(31, 2, "{{substantiationNote}}", S.WRAP)
sheet.merge(31, 2, 31, 7)

xlsx.write(OUT, [sheet], doc_title="Expense Report Template")
print(f"wrote {OUT.relative_to(Path(__file__).resolve().parent.parent)} "
      f"({OUT.stat().st_size} bytes)")
