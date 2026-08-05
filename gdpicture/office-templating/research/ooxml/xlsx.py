"""SpreadsheetML authoring.

Sheets are built from a cell model and serialised in one pass, so the invariants Excel
enforces hold by construction: no duplicate cell references, rows and columns in ascending
order. Editing sheet XML as text is what produced the duplicate-``B3`` corruption recorded
in research/FINDINGS.md §8 — this module exists so that can't recur.
"""

import zipfile

from . import ACCENT, BAND, FONT, INK, MUTED, RULE, esc

MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
RELS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"


def col_name(index):
    """1 -> A, 27 -> AA."""
    name = ""
    while index > 0:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


class Sheet:
    """A worksheet under construction.

    Style indices refer to the fixed cellXfs table in :data:`_STYLES` below.
    """

    # cellXfs indices, in the order they're declared in _STYLES.
    PLAIN = 0
    BOLD = 1
    TITLE = 2
    LABEL = 3       # small caps-ish muted label
    HEADER = 4      # banded column header
    MONEY = 5
    MONEY_BOLD = 6
    DATE = 7
    PERCENT = 8
    NUMBER = 9
    ACCENT_BOLD = 10
    RULE_TOP = 11
    WRAP = 12

    def __init__(self, name):
        self.name = name
        self._cells = {}          # (row, col) -> (value, style, kind)
        self._widths = {}         # col -> width
        self._row_heights = {}    # row -> height
        self._merges = []

    def set(self, row, col, value, style=PLAIN, kind="inlineStr"):
        """Places a cell. ``kind`` is 'inlineStr' or 'n' (number)."""
        self._cells[(row, col)] = (value, style, kind)

    def text(self, row, col, value, style=PLAIN):
        self.set(row, col, value, style, "inlineStr")

    def number(self, row, col, value, style=NUMBER):
        self.set(row, col, value, style, "n")

    def width(self, col, chars):
        self._widths[col] = chars

    def height(self, row, points):
        self._row_heights[row] = points

    def merge(self, row1, col1, row2, col2):
        self._merges.append(
            f"{col_name(col1)}{row1}:{col_name(col2)}{row2}")

    def xml(self, drawing_rel=None):
        if self._cells:
            max_row = max(r for r, _ in self._cells)
            max_col = max(c for _, c in self._cells)
            dimension = f'<dimension ref="A1:{col_name(max_col)}{max_row}"/>'
        else:
            dimension = '<dimension ref="A1"/>'

        cols = ""
        if self._widths:
            entries = "".join(
                f'<col min="{c}" max="{c}" width="{w}" customWidth="1"/>'
                for c, w in sorted(self._widths.items()))
            cols = f"<cols>{entries}</cols>"

        # Rows and cells ascending — Excel rejects any other order.
        rows_xml = []
        for r in sorted({row for row, _ in self._cells}):
            cells = []
            for c in sorted(col for row, col in self._cells if row == r):
                value, style, kind = self._cells[(r, c)]
                ref = f"{col_name(c)}{r}"
                if kind == "n":
                    cells.append(f'<c r="{ref}" s="{style}"><v>{value}</v></c>')
                else:
                    # The <r> rich-text run wrapper is required, not decorative: the
                    # templater returns GenericError on a bare <is><t>. Excel writes the
                    # wrapper itself, which is why real fixtures work and hand-built
                    # sheets without it don't.
                    cells.append(
                        f'<c r="{ref}" s="{style}" t="inlineStr">'
                        f'<is><r><t xml:space="preserve">{esc(value)}</t></r></is></c>')

            attrs = f' ht="{self._row_heights[r]}" customHeight="1"' if r in self._row_heights else ""
            rows_xml.append(f'<row r="{r}"{attrs}>{"".join(cells)}</row>')

        merges = ""
        if self._merges:
            entries = "".join(f'<mergeCell ref="{m}"/>' for m in self._merges)
            merges = f'<mergeCells count="{len(self._merges)}">{entries}</mergeCells>'

        drawing = f'<drawing r:id="{drawing_rel}"/>' if drawing_rel else ""

        return (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                f'<worksheet xmlns="{MAIN}" xmlns:r="{RELS}">'
                f'{dimension}'
                f'<sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>'
                f'<sheetFormatPr defaultRowHeight="15"/>'
                f'{cols}<sheetData>{"".join(rows_xml)}</sheetData>{merges}{drawing}'
                f"</worksheet>")


# Number formats start at 164 by convention; 0-163 are built in.
_STYLES = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="{MAIN}">
<numFmts count="3">
<numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0.00"/>
<numFmt numFmtId="165" formatCode="yyyy\\-mm\\-dd"/>
<numFmt numFmtId="166" formatCode="0.0%"/>
</numFmts>
<fonts count="7">
<font><sz val="11"/><color rgb="FF{INK}"/><name val="{FONT}"/></font>
<font><b/><sz val="11"/><color rgb="FF{INK}"/><name val="{FONT}"/></font>
<font><b/><sz val="26"/><color rgb="FF{INK}"/><name val="{FONT}"/></font>
<font><sz val="8"/><color rgb="FF{MUTED}"/><name val="{FONT}"/></font>
<font><b/><sz val="8"/><color rgb="FF{MUTED}"/><name val="{FONT}"/></font>
<font><b/><sz val="11"/><color rgb="FF{ACCENT}"/><name val="{FONT}"/></font>
<font><sz val="10"/><color rgb="FF{MUTED}"/><name val="{FONT}"/></font>
</fonts>
<fills count="3">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF{BAND}"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="3">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left/><right/><top/><bottom style="thin"><color rgb="FF{RULE}"/></bottom><diagonal/></border>
<border><left/><right/><top style="thin"><color rgb="FF{RULE}"/></top><bottom/><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="13">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="4" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="164" fontId="1" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="164" fontId="5" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="2" xfId="0"/>
<xf numFmtId="0" fontId="6" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>
</cellXfs>
</styleSheet>"""


def write(path, sheets, *, doc_title):
    """Writes a .docx-style package for one or more :class:`Sheet` objects."""
    sheet_entries = "".join(
        f'<sheet name="{esc(s.name)}" sheetId="{i}" r:id="rId{i}"/>'
        for i, s in enumerate(sheets, start=1))

    workbook = (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                f'<workbook xmlns="{MAIN}" xmlns:r="{RELS}">'
                f"<sheets>{sheet_entries}</sheets></workbook>")

    # Styles is the part after the sheets, so its rId follows them.
    styles_rid = len(sheets) + 1
    wb_rels = "".join(
        f'<Relationship Id="rId{i}" Type="{RELS}/worksheet" '
        f'Target="worksheets/sheet{i}.xml"/>'
        for i in range(1, len(sheets) + 1))
    wb_rels += (f'<Relationship Id="rId{styles_rid}" Type="{RELS}/styles" '
                f'Target="styles.xml"/>')

    overrides = "".join(
        f'<Override PartName="/xl/worksheets/sheet{i}.xml" '
        f'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        for i in range(1, len(sheets) + 1))

    content_types = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
{overrides}
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>"""

    root_rels = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="{RELS}/officeDocument" Target="xl/workbook.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>"""

    core = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:title>{esc(doc_title)}</dc:title>
<dc:creator>Nutrient Office Templating Demo</dc:creator>
</cp:coreProperties>"""

    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", root_rels)
        z.writestr("xl/workbook.xml", workbook)
        z.writestr("xl/_rels/workbook.xml.rels",
                   f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   f'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                   f"{wb_rels}</Relationships>")
        z.writestr("xl/styles.xml", _STYLES)
        for i, sheet in enumerate(sheets, start=1):
            z.writestr(f"xl/worksheets/sheet{i}.xml", sheet.xml())
        z.writestr("docProps/core.xml", core)

    return path
