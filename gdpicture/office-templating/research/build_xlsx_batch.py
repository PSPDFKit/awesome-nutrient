#!/usr/bin/env python3
"""Authors the remaining XLSX templates.

Structures follow research/DOCUMENT-CONVENTIONS.md. Two conventions from that research
are honoured deliberately:

* money and percentages are JSON *numbers*, not formatted strings — a currency cell fed
  "3,307.08" renders as a date (FINDINGS.md §9);
* the budget carries a per-row `type` flag, because variance inverts between expense and
  revenue rows and one global formula gets half of them backwards.
"""

import json
from pathlib import Path

from ooxml import xlsx

TEMPLATES = (Path(__file__).resolve().parent.parent
             / "src" / "NutrientOfficeTemplating" / "Templates")

S = xlsx.Sheet


def write(name, sheets, *, doc_title, model, meta):
    xlsx.write(TEMPLATES / f"{name}.xlsx", sheets, doc_title=doc_title)

    with open(TEMPLATES / f"{name}.model.json", "w", encoding="utf8") as f:
        json.dump({"config": {"delimiter": {"start": "{{", "end": "}}"}}, "model": model},
                  f, indent=4, ensure_ascii=False)
        f.write("\n")

    with open(TEMPLATES / f"{name}.meta.json", "w", encoding="utf8") as f:
        json.dump(meta, f, indent=4, ensure_ascii=False)
        f.write("\n")

    print(f"  {name}.xlsx ({(TEMPLATES / f'{name}.xlsx').stat().st_size} bytes)")


def header(sheet, row, labels, start_col=2):
    for offset, label in enumerate(labels):
        sheet.text(row, start_col + offset, label, S.HEADER)
    sheet.height(row, 20)


# ------------------------------------------------------------------ timesheet

def timesheet():
    """Weekly timesheet.

    Days are rows rather than columns — the orientation DOL's own sample uses — and the
    week is explicit because FLSA overtime is computed weekly, not daily or monthly. The
    workweek start is a field, not hardcoded: Oklahoma and Utah run Saturday–Friday.
    """
    sheet = S("Timesheet")
    for col, chars in {1: 3, 2: 14, 3: 12, 4: 22, 5: 11, 6: 11, 7: 11, 8: 12}.items():
        sheet.width(col, chars)

    sheet.text(1, 2, "TIMESHEET", S.TITLE)
    sheet.height(1, 34)

    sheet.text(3, 2, "Employee", S.LABEL);      sheet.text(3, 3, "{{employee.name}}", S.BOLD)
    sheet.text(3, 6, "Week ending", S.LABEL);   sheet.text(3, 8, "{{period.weekEnding}}", S.PLAIN)
    sheet.text(4, 2, "Employee ID", S.LABEL);   sheet.text(4, 3, "{{employee.id}}", S.PLAIN)
    sheet.text(4, 6, "Workweek starts", S.LABEL); sheet.text(4, 8, "{{period.weekStartsOn}}", S.PLAIN)
    sheet.text(5, 2, "Department", S.LABEL);    sheet.text(5, 3, "{{employee.department}}", S.PLAIN)
    sheet.text(5, 6, "Pay group", S.LABEL);     sheet.text(5, 8, "{{employee.payGroup}}", S.PLAIN)
    sheet.text(6, 2, "Supervisor", S.LABEL);    sheet.text(6, 3, "{{employee.supervisor}}", S.PLAIN)

    sheet.text(8, 2, "Hours by day", S.BOLD)
    header(sheet, 9, ["Date", "Day", "Project / task", "In", "Out", "Hours", "Pay code"])

    sheet.text(10, 2, "{{#days}}{{date}}", S.PLAIN)
    sheet.text(10, 3, "{{day}}", S.PLAIN)
    sheet.text(10, 4, "{{task}}", S.PLAIN)
    sheet.text(10, 5, "{{timeIn}}", S.PLAIN)
    sheet.text(10, 6, "{{timeOut}}", S.PLAIN)
    sheet.text(10, 7, "{{hours}}", S.NUMBER)
    sheet.text(10, 8, "{{payCode}}{{/days}}", S.PLAIN)

    sheet.text(12, 2, "Weekly totals", S.BOLD)
    header(sheet, 13, ["Category", "Hours"])
    sheet.text(14, 2, "{{#totals}}{{category}}", S.PLAIN)
    sheet.text(14, 3, "{{hours}}{{/totals}}", S.NUMBER)

    sheet.text(16, 2, "Total hours", S.BOLD)
    sheet.text(16, 3, "{{totalHours}}", S.BOLD)
    sheet.text(17, 2, "Of which overtime", S.LABEL)
    sheet.text(17, 3, "{{overtimeHours}}", S.ACCENT_BOLD)

    sheet.text(20, 2, "Certification", S.BOLD)
    sheet.text(21, 2, "{{certification}}", S.WRAP)
    sheet.merge(21, 2, 21, 8)

    sheet.text(24, 2, "Employee", S.LABEL);   sheet.text(24, 3, "{{employee.name}}", S.PLAIN)
    sheet.text(24, 6, "Date", S.LABEL);       sheet.text(24, 8, "{{submittedDate}}", S.PLAIN)
    sheet.text(25, 2, "Supervisor", S.LABEL); sheet.text(25, 3, "{{employee.supervisor}}", S.PLAIN)
    sheet.text(25, 6, "Date", S.LABEL);       sheet.text(25, 8, "{{approvedDate}}", S.PLAIN)

    model = {
        "employee": {"name": "Sam Okonkwo", "id": "E-10902",
                     "department": "Professional Services", "payGroup": "Biweekly, non-exempt",
                     "supervisor": "Marta Feld"},
        "period": {"weekEnding": "2026-08-07", "weekStartsOn": "Saturday"},
        "days": [
            {"date": "2026-08-01", "day": "Saturday", "task": "—",
             "timeIn": "—", "timeOut": "—", "hours": 0, "payCode": "—"},
            {"date": "2026-08-02", "day": "Sunday", "task": "—",
             "timeIn": "—", "timeOut": "—", "hours": 0, "payCode": "—"},
            {"date": "2026-08-03", "day": "Monday", "task": "Acme — template authoring",
             "timeIn": "09:00", "timeOut": "17:30", "hours": 8, "payCode": "REG"},
            {"date": "2026-08-04", "day": "Tuesday", "task": "Acme — template authoring",
             "timeIn": "08:45", "timeOut": "18:15", "hours": 9, "payCode": "REG"},
            {"date": "2026-08-05", "day": "Wednesday", "task": "Internal — release review",
             "timeIn": "09:00", "timeOut": "17:00", "hours": 7.5, "payCode": "REG"},
            {"date": "2026-08-06", "day": "Thursday", "task": "Acme — accessibility rework",
             "timeIn": "09:00", "timeOut": "19:00", "hours": 9.5, "payCode": "REG"},
            {"date": "2026-08-07", "day": "Friday", "task": "Acme — accessibility rework",
             "timeIn": "09:00", "timeOut": "18:00", "hours": 8, "payCode": "REG"},
        ],
        "totals": [
            {"category": "Regular", "hours": 40},
            {"category": "Overtime", "hours": 2},
            {"category": "Paid leave", "hours": 0},
            {"category": "Unpaid", "hours": 0},
        ],
        "totalHours": 42,
        "overtimeHours": 2,
        "certification": (
            "I certify that this time report correctly reflects all time worked by me for "
            "the pay period indicated. Overtime is calculated on hours worked over 40 in "
            "the workweek, in accordance with the Fair Labor Standards Act."),
        "submittedDate": "2026-08-07",
        "approvedDate": "2026-08-10",
    }

    write("timesheet", [sheet], doc_title="Timesheet Template", model=model,
          meta={"order": 3, "title": "Timesheet",
                "subtitle": "Days as rows, with a weekly boundary so overtime computes.",
                "features": ["Two row loops", "Numeric hours", "Certification block"]})


# ------------------------------------------------------------------ budget

def budget():
    """Departmental budget, budget vs actual vs variance.

    The `type` column exists because variance inverts: for expenses it's
    Budget − Actual (positive = underspent = good), for revenue Actual − Budget. One
    global formula gets half the rows backwards, which the research flagged as the most
    common modelling error in budget templates.
    """
    sheet = S("Budget")
    for col, chars in {1: 3, 2: 10, 3: 30, 4: 11, 5: 13, 6: 13, 7: 12, 8: 10, 9: 11}.items():
        sheet.width(col, chars)

    sheet.text(1, 2, "DEPARTMENTAL BUDGET", S.TITLE)
    sheet.height(1, 34)
    sheet.merge(1, 2, 1, 4)

    sheet.text(3, 2, "Department", S.LABEL);  sheet.text(3, 3, "{{department.name}}", S.BOLD)
    sheet.text(3, 7, "Fiscal year", S.LABEL); sheet.text(3, 9, "{{fiscalYear}}", S.PLAIN)
    sheet.text(4, 2, "Cost centre", S.LABEL); sheet.text(4, 3, "{{department.costCentre}}", S.PLAIN)
    sheet.text(4, 7, "Period", S.LABEL);      sheet.text(4, 9, "{{period}}", S.PLAIN)
    sheet.text(5, 2, "Contact", S.LABEL);     sheet.text(5, 3, "{{department.contact}}", S.PLAIN)
    sheet.text(5, 7, "Basis", S.LABEL);       sheet.text(5, 9, "{{basis}}", S.PLAIN)

    sheet.text(7, 2, "{{subtitle}}", S.LABEL)

    header(sheet, 9, ["Account", "Line", "Type", "Budget", "Actual",
                      "Variance", "Var %", "Status"])

    sheet.text(10, 2, "{{#lines}}{{account}}", S.PLAIN)
    sheet.text(10, 3, "{{name}}", S.PLAIN)
    sheet.text(10, 4, "{{type}}", S.PLAIN)
    sheet.text(10, 5, "{{budget}}", S.MONEY)
    sheet.text(10, 6, "{{actual}}", S.MONEY)
    sheet.text(10, 7, "{{variance}}", S.MONEY)
    sheet.text(10, 8, "{{variancePct}}", S.PERCENT)
    sheet.text(10, 9, "{{status}}{{/lines}}", S.PLAIN)

    sheet.text(12, 3, "Total expenditure", S.BOLD)
    sheet.text(12, 5, "{{totals.budget}}", S.MONEY_BOLD)
    sheet.text(12, 6, "{{totals.actual}}", S.MONEY_BOLD)
    sheet.text(12, 7, "{{totals.variance}}", S.ACCENT_BOLD)
    sheet.text(12, 8, "{{totals.variancePct}}", S.PERCENT)

    sheet.text(15, 2, "Variance explanations", S.BOLD)
    sheet.text(16, 2, "{{varianceThreshold}}", S.LABEL)
    sheet.merge(16, 2, 16, 9)

    header(sheet, 17, ["Account", "Explanation"])
    sheet.text(18, 2, "{{#explanations}}{{account}}", S.PLAIN)
    sheet.text(18, 3, "{{explanation}}{{/explanations}}", S.WRAP)

    sheet.text(21, 2, "Prepared by", S.LABEL);  sheet.text(21, 3, "{{preparedBy}}", S.PLAIN)
    sheet.text(21, 7, "Date", S.LABEL);         sheet.text(21, 9, "{{preparedDate}}", S.PLAIN)
    sheet.text(22, 2, "Approved by", S.LABEL);  sheet.text(22, 3, "{{approvedBy}}", S.PLAIN)
    sheet.text(22, 7, "Date", S.LABEL);         sheet.text(22, 9, "{{approvedDate}}", S.PLAIN)

    model = {
        "department": {"name": "Solutions Engineering", "costCentre": "CC-4200",
                       "contact": "marta.feld@nutrient.io"},
        "fiscalYear": "FY 2026",
        "period": "Q3, to 2026-06-30",
        "basis": "Modified accrual",
        "subtitle": "Unaudited budget to actuals",
        "lines": [
            {"account": "5105", "name": "Salaries — administrative", "type": "Expense",
             "budget": 180000, "actual": 176400, "variance": 3600, "variancePct": 0.02,
             "status": "Green"},
            {"account": "5110", "name": "Salaries — staff", "type": "Expense",
             "budget": 640000, "actual": 661200, "variance": -21200, "variancePct": -0.033,
             "status": "Amber"},
            {"account": "5125", "name": "Overtime", "type": "Expense",
             "budget": 24000, "actual": 31800, "variance": -7800, "variancePct": -0.325,
             "status": "Red"},
            {"account": "5430", "name": "Fees for professional services", "type": "Expense",
             "budget": 96000, "actual": 78500, "variance": 17500, "variancePct": 0.182,
             "status": "Green"},
            {"account": "5440", "name": "Staff development", "type": "Expense",
             "budget": 30000, "actual": 12250, "variance": 17750, "variancePct": 0.592,
             "status": "Amber"},
            {"account": "5445", "name": "Travel and mileage", "type": "Expense",
             "budget": 45000, "actual": 44100, "variance": 900, "variancePct": 0.02,
             "status": "Green"},
            {"account": "4210", "name": "Recharges to product teams", "type": "Revenue",
             "budget": 120000, "actual": 134500, "variance": 14500, "variancePct": 0.121,
             "status": "Green"},
        ],
        "totals": {"budget": 1015000, "actual": 1004250, "variance": 10750,
                   "variancePct": 0.011},
        "varianceThreshold": (
            "An explanation is required for any line exceeding both $10,000 and 10% "
            "variance. Positive variance is favourable on both expense and revenue lines; "
            "note that the two are computed in opposite directions."),
        "explanations": [
            {"account": "5125",
             "explanation": "Overtime ran ahead of plan during the accessibility rework. "
                            "Additional review capacity has been approved to reduce reliance "
                            "on overtime in Q4."},
            {"account": "5440",
             "explanation": "Two conference bookings were deferred to Q4; spend is expected "
                            "to normalise by year end."},
        ],
        "preparedBy": "Jordan Reyes",
        "preparedDate": "2026-07-14",
        "approvedBy": "Dana Whitfield",
        "approvedDate": "2026-07-18",
    }

    write("budget", [sheet], doc_title="Departmental Budget Template", model=model,
          meta={"order": 4, "title": "Budget",
                "subtitle": "Budget vs actual with variance, and a per-row expense/revenue flag.",
                "features": ["Two row loops", "Percentage cells", "Variance explanations"]})


# ------------------------------------------------------------------ quote

def quote():
    """Sales quote — line items with discount, tax and validity."""
    sheet = S("Quote")
    for col, chars in {1: 3, 2: 8, 3: 34, 4: 8, 5: 12, 6: 10, 7: 13}.items():
        sheet.width(col, chars)

    sheet.text(1, 2, "QUOTATION", S.TITLE)
    sheet.height(1, 34)

    sheet.text(3, 2, "{{%logo}}", S.PLAIN)

    sheet.text(3, 5, "Quote no.", S.LABEL);  sheet.text(3, 7, "{{quoteNo}}", S.BOLD)
    sheet.text(4, 5, "Date", S.LABEL);       sheet.text(4, 7, "{{quoteDate}}", S.PLAIN)
    sheet.text(5, 5, "Valid until", S.LABEL); sheet.text(5, 7, "{{validUntil}}", S.PLAIN)
    sheet.text(6, 5, "Currency", S.LABEL);   sheet.text(6, 7, "{{currency}}", S.PLAIN)

    sheet.text(8, 2, "Prepared for", S.LABEL)
    sheet.text(9, 2, "{{client.name}}", S.BOLD)
    sheet.text(10, 2, "{{client.contact}}", S.PLAIN)
    sheet.text(11, 2, "{{client.address}}", S.PLAIN)

    sheet.text(13, 2, "Items", S.BOLD)
    header(sheet, 14, ["Item", "Description", "Qty", "Unit price", "Discount", "Amount"])

    sheet.text(15, 2, "{{#items}}{{ref}}", S.PLAIN)
    sheet.text(15, 3, "{{description}}", S.PLAIN)
    sheet.text(15, 4, "{{quantity}}", S.NUMBER)
    sheet.text(15, 5, "{{unitPrice}}", S.MONEY)
    sheet.text(15, 6, "{{discount}}", S.PERCENT)
    sheet.text(15, 7, "{{amount}}{{/items}}", S.MONEY)

    sheet.text(17, 6, "Subtotal", S.LABEL);   sheet.text(17, 7, "{{subtotal}}", S.MONEY)
    sheet.text(18, 6, "Discount", S.LABEL);   sheet.text(18, 7, "{{discountTotal}}", S.MONEY)
    sheet.text(19, 6, "{{taxLabel}}", S.LABEL); sheet.text(19, 7, "{{tax}}", S.MONEY)
    sheet.text(20, 6, "Total", S.BOLD);       sheet.text(20, 7, "{{total}}", S.ACCENT_BOLD)

    sheet.text(23, 2, "Terms", S.BOLD)
    header(sheet, 24, ["Term", "Detail"])
    sheet.text(25, 2, "{{#terms}}{{label}}", S.PLAIN)
    sheet.text(25, 3, "{{detail}}{{/terms}}", S.WRAP)

    sheet.text(28, 2, "{{footnote}}", S.WRAP)
    sheet.merge(28, 2, 28, 7)

    logo = json.loads((TEMPLATES / "contract.model.json").read_text())["model"]["logo"]

    model = {
        "quoteNo": "Q-2026-0311",
        "quoteDate": "2026-08-06",
        "validUntil": "2026-09-05",
        "currency": "EUR",
        "client": {"name": "Acme Corporation",
                   "contact": "Dana Whitfield, VP Operations",
                   "address": "1 Market Street, San Francisco, CA 94105"},
        "items": [
            {"ref": "1", "description": "Nutrient .NET SDK — production licence, 1 year",
             "quantity": 1, "unitPrice": 18000, "discount": 0.0, "amount": 18000},
            {"ref": "2", "description": "Nutrient Web SDK — production licence, 1 year",
             "quantity": 1, "unitPrice": 14000, "discount": 0.1, "amount": 12600},
            {"ref": "3", "description": "Implementation services — template authoring",
             "quantity": 12, "unitPrice": 1400, "discount": 0.0, "amount": 16800},
            {"ref": "4", "description": "Priority support, 12 months",
             "quantity": 1, "unitPrice": 6000, "discount": 0.15, "amount": 5100},
        ],
        "subtitle": "",
        "subtotal": 54800,
        "discountTotal": -2300,
        "taxLabel": "VAT at 19%",
        "tax": 9975,
        "total": 62475,
        "terms": [
            {"label": "Payment", "detail": "Net 30 from date of invoice."},
            {"label": "Delivery", "detail": "Licence keys issued within two business days of order."},
            {"label": "Validity", "detail": "This quotation is valid for 30 days from its date."},
        ],
        "footnote": ("Prices exclude any withholding tax. Licence terms are those of the "
                     "Nutrient SDK subscription agreement in force at the order date."),
        "logo": logo,
    }

    write("quote", [sheet], doc_title="Sales Quotation Template", model=model,
          meta={"order": 5, "title": "Quotation",
                "subtitle": "Line items with per-line discount, tax, and a terms table.",
                "features": ["Two row loops", "Percentage cells", "Image in a cell"]})


# ------------------------------------------------------------------ price list

def price_list():
    """Price list — a long single loop across product tiers, in two sheets."""
    products = S("Price list")
    for col, chars in {1: 3, 2: 12, 3: 34, 4: 14, 5: 12, 6: 12, 7: 12}.items():
        products.width(col, chars)

    products.text(1, 2, "PRICE LIST", S.TITLE)
    products.height(1, 34)

    products.text(3, 2, "Effective", S.LABEL);  products.text(3, 3, "{{effectiveDate}}", S.BOLD)
    products.text(4, 2, "Currency", S.LABEL);   products.text(4, 3, "{{currency}}", S.PLAIN)
    products.text(5, 2, "Region", S.LABEL);     products.text(5, 3, "{{region}}", S.PLAIN)

    products.text(7, 2, "Products", S.BOLD)
    header(products, 8, ["SKU", "Product", "Tier", "List price", "Annual", "Unit"])

    products.text(9, 2, "{{#products}}{{sku}}", S.PLAIN)
    products.text(9, 3, "{{name}}", S.PLAIN)
    products.text(9, 4, "{{tier}}", S.PLAIN)
    products.text(9, 5, "{{listPrice}}", S.MONEY)
    products.text(9, 6, "{{annualPrice}}", S.MONEY)
    products.text(9, 7, "{{unit}}{{/products}}", S.PLAIN)

    products.text(11, 2, "{{notes}}", S.WRAP)
    products.merge(11, 2, 11, 7)

    # A second sheet — volume discounts. Nothing in the library had a multi-sheet workbook.
    discounts = S("Volume discounts")
    for col, chars in {1: 3, 2: 18, 3: 18, 4: 14, 5: 30}.items():
        discounts.width(col, chars)

    discounts.text(1, 2, "VOLUME DISCOUNTS", S.TITLE)
    discounts.height(1, 34)
    discounts.merge(1, 2, 1, 3)

    header(discounts, 3, ["From", "To", "Discount", "Applies to"])
    discounts.text(4, 2, "{{#volumeBands}}{{from}}", S.NUMBER)
    discounts.text(4, 3, "{{to}}", S.PLAIN)
    discounts.text(4, 4, "{{discount}}", S.PERCENT)
    discounts.text(4, 5, "{{appliesTo}}{{/volumeBands}}", S.PLAIN)

    discounts.text(6, 2, "{{discountNote}}", S.WRAP)
    discounts.merge(6, 2, 6, 5)

    model = {
        "effectiveDate": "2026-09-01",
        "currency": "EUR",
        "region": "EMEA",
        "products": [
            {"sku": "NUT-DOT-STD", "name": "Nutrient .NET SDK", "tier": "Standard",
             "listPrice": 12000, "annualPrice": 12000, "unit": "per server"},
            {"sku": "NUT-DOT-PRO", "name": "Nutrient .NET SDK", "tier": "Professional",
             "listPrice": 18000, "annualPrice": 18000, "unit": "per server"},
            {"sku": "NUT-DOT-ENT", "name": "Nutrient .NET SDK", "tier": "Enterprise",
             "listPrice": 32000, "annualPrice": 32000, "unit": "per server"},
            {"sku": "NUT-WEB-STD", "name": "Nutrient Web SDK", "tier": "Standard",
             "listPrice": 9000, "annualPrice": 9000, "unit": "per domain"},
            {"sku": "NUT-WEB-PRO", "name": "Nutrient Web SDK", "tier": "Professional",
             "listPrice": 14000, "annualPrice": 14000, "unit": "per domain"},
            {"sku": "NUT-OCR-ADD", "name": "OCR add-on", "tier": "Add-on",
             "listPrice": 4500, "annualPrice": 4500, "unit": "per server"},
            {"sku": "NUT-SUP-PRI", "name": "Priority support", "tier": "Service",
             "listPrice": 6000, "annualPrice": 6000, "unit": "per contract"},
            {"sku": "NUT-TPL-AUT", "name": "Template authoring", "tier": "Service",
             "listPrice": 1400, "annualPrice": 0, "unit": "per template"},
        ],
        "notes": ("List prices exclude VAT. Annual prices apply to subscription terms of "
                  "twelve months; multi-year terms are quoted separately."),
        "volumeBands": [
            {"from": 1, "to": "4", "discount": 0.0, "appliesTo": "All products"},
            {"from": 5, "to": "9", "discount": 0.08, "appliesTo": "Licences only"},
            {"from": 10, "to": "24", "discount": 0.15, "appliesTo": "Licences only"},
            {"from": 25, "to": "and above", "discount": 0.22, "appliesTo": "Licences and add-ons"},
        ],
        "discountNote": ("Volume discounts apply to licence quantity on a single order and "
                         "are not cumulative with promotional pricing."),
    }

    write("price-list", [products, discounts],
          doc_title="Price List Template", model=model,
          meta={"order": 6, "title": "Price list",
                "subtitle": "Two worksheets — products and volume discount bands.",
                "features": ["Multi-sheet workbook", "Two row loops", "Percentage cells"]})


if __name__ == "__main__":
    print("XLSX templates:")
    timesheet()
    budget()
    quote()
    price_list()
