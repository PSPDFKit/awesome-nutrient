#!/usr/bin/env python3
"""Author the DOCX showcase template: a service agreement.

Hand-built OOXML so the {{...}} placeholders survive intact. Word likes to split runs
mid-word, which would break a placeholder; building the XML directly avoids that
entirely — each placeholder sits in exactly one <w:t>.

Demonstrates: scalar fields, dotted paths, a table row loop, and a conditional block.
"""
import zipfile
from pathlib import Path

OUT = (Path(__file__).resolve().parent.parent
       / "src" / "NutrientOfficeTemplating" / "Templates" / "contract.docx")

W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def run(text, *, b=False, i=False, sz=None, color=None, font="Archivo"):
    rpr = "<w:rPr>"
    rpr += f'<w:rFonts w:ascii="{font}" w:hAnsi="{font}"/>'
    if b:
        rpr += "<w:b/>"
    if i:
        rpr += "<w:i/>"
    if sz:
        rpr += f'<w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/>'
    if color:
        rpr += f'<w:color w:val="{color}"/>'
    rpr += "</w:rPr>"
    # xml:space="preserve" keeps leading/trailing spaces around placeholders.
    return f'<w:r>{rpr}<w:t xml:space="preserve">{esc(text)}</w:t></w:r>'


def para(runs, *, align=None, space_after=120, space_before=0, style=None):
    ppr = "<w:pPr>"
    if style:
        ppr += f'<w:pStyle w:val="{style}"/>'
    if align:
        ppr += f'<w:jc w:val="{align}"/>'
    ppr += f'<w:spacing w:before="{space_before}" w:after="{space_after}"/>'
    ppr += "</w:pPr>"
    return f"<w:p>{ppr}{''.join(runs)}</w:p>"


def marker(text):
    """A paragraph holding only a section marker, squeezed to nothing.

    Zero spacing and an exact 1-twip line height, so the paragraph left behind once
    the section resolves adds no visible space to the finished document.
    """
    return (f'<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="1" '
            f'w:lineRule="exact"/></w:pPr>{run(text)}</w:p>')


def cell(runs, *, w=2400, align=None, shade=None, valign="center"):
    tcpr = f'<w:tcPr><w:tcW w:w="{w}" w:type="dxa"/>'
    if shade:
        tcpr += f'<w:shd w:val="clear" w:color="auto" w:fill="{shade}"/>'
    tcpr += f'<w:vAlign w:val="{valign}"/>'
    tcpr += "</w:tcPr>"
    return f"<w:tc>{tcpr}{para(runs, align=align, space_after=60)}</w:tc>"


ACCENT = "F25E45"   # Code Coral
INK = "1A1414"      # Warm Black
MUTED = "67594B"    # Warm Grey

body = []

# ---- Letterhead logo.
# DOCX is the only format that honours the full image option set (sizing, border,
# altText/title, rotation, link, caption + auto-numbered SEQ label) — see
# research/IMAGE-OPTIONS.md for the verified per-format matrix.
body.append(para([run("{{%logo}}")], space_after=200))

# ---- Title block
body.append(para([run("SERVICE AGREEMENT", b=True, sz=40, color=INK)], space_after=40))
body.append(para(
    [run("Agreement no. ", sz=18, color=MUTED), run("{{agreementNo}}", sz=18, color=ACCENT),
     run("   ·   Effective ", sz=18, color=MUTED), run("{{effectiveDate}}", sz=18, color=ACCENT)],
    space_after=320))

# ---- Parties, two columns
body.append(para([run("1.  Parties", b=True, sz=26, color=INK)], space_after=140))

parties = f'''<w:tbl>
<w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblBorders>
<w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/>
<w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders></w:tblPr>
<w:tblGrid><w:gridCol w:w="4680"/><w:gridCol w:w="4680"/></w:tblGrid>
<w:tr>
{cell([run("PROVIDER", b=True, sz=16, color=MUTED)], w=4680)}
{cell([run("CLIENT", b=True, sz=16, color=MUTED)], w=4680)}
</w:tr>
<w:tr>
{cell([run("{{provider.name}}", b=True, sz=22, color=INK)], w=4680)}
{cell([run("{{client.name}}", b=True, sz=22, color=INK)], w=4680)}
</w:tr>
<w:tr>
{cell([run("{{provider.address}}", sz=19)], w=4680)}
{cell([run("{{client.address}}", sz=19)], w=4680)}
</w:tr>
<w:tr>
{cell([run("{{provider.email}}", sz=19, color=MUTED)], w=4680)}
{cell([run("{{client.email}}", sz=19, color=MUTED)], w=4680)}
</w:tr>
</w:tbl>'''
body.append(parties)
body.append(para([run("")], space_after=240))

# ---- Scope, conditional intro
body.append(para([run("2.  Scope of work", b=True, sz=26, color=INK)], space_after=140))
body.append(para([run("{{scopeSummary}}", sz=20)], space_after=180))

# ---- Deliverables table with a row loop
header_shade = "F2EFEC"
rows = [f'''<w:tr><w:trPr><w:tblHeader/></w:trPr>
{cell([run("#", b=True, sz=17, color=MUTED)], w=700, shade=header_shade)}
{cell([run("DELIVERABLE", b=True, sz=17, color=MUTED)], w=4400, shade=header_shade)}
{cell([run("DUE", b=True, sz=17, color=MUTED)], w=1900, shade=header_shade)}
{cell([run("FEE", b=True, sz=17, color=MUTED)], w=1600, shade=header_shade, align="right")}
</w:tr>''']

# The loop opens in the first cell of the row and closes in the last, so the whole
# <w:tr> repeats — the same pattern the Nutrient XLSX invoice fixture uses.
rows.append(f'''<w:tr>
{cell([run("{{#deliverables}}{{ref}}", sz=19, color=MUTED)], w=700)}
{cell([run("{{title}}", sz=19, color=INK)], w=4400)}
{cell([run("{{due}}", sz=19)], w=1900)}
{cell([run("{{fee}}{{/deliverables}}", sz=19)], w=1600, align="right")}
</w:tr>''')

rows.append(f'''<w:tr>
{cell([run("", sz=19)], w=700)}
{cell([run("Total", b=True, sz=19, color=INK)], w=4400)}
{cell([run("", sz=19)], w=1900)}
{cell([run("{{totalFee}}", b=True, sz=19, color=ACCENT)], w=1600, align="right")}
</w:tr>''')

table = f'''<w:tbl>
<w:tblPr><w:tblW w:w="8600" w:type="dxa"/><w:tblBorders>
<w:top w:val="single" w:sz="4" w:color="E2DBD9"/>
<w:left w:val="none"/><w:right w:val="none"/>
<w:bottom w:val="single" w:sz="4" w:color="E2DBD9"/>
<w:insideH w:val="single" w:sz="4" w:color="E2DBD9"/>
<w:insideV w:val="none"/></w:tblBorders></w:tblPr>
<w:tblGrid><w:gridCol w:w="700"/><w:gridCol w:w="4400"/><w:gridCol w:w="1900"/><w:gridCol w:w="1600"/></w:tblGrid>
{''.join(rows)}
</w:tbl>'''
body.append(table)
body.append(para([run("")], space_after=240))

# ---- Payment schedule: a second table, driven by a different collection.
# Two independent row loops in one Word document — the deliverables table above and
# this one — which nothing else in the library demonstrates.
body.append(para([run("3.  Payment schedule", b=True, sz=26, color=INK)],
                 space_after=140))

SCHED_SHADE = "F2EFEC"
sched_rows = [f'''<w:tr><w:trPr><w:tblHeader/></w:trPr>
{cell([run("MILESTONE", b=True, sz=17, color=MUTED)], w=3600, shade=SCHED_SHADE)}
{cell([run("TRIGGER", b=True, sz=17, color=MUTED)], w=3200, shade=SCHED_SHADE)}
{cell([run("DUE", b=True, sz=17, color=MUTED)], w=1200, shade=SCHED_SHADE)}
{cell([run("AMOUNT", b=True, sz=17, color=MUTED)], w=1400, shade=SCHED_SHADE, align="right")}
</w:tr>''']

# The loop opens in the first cell and closes in the last, so the whole row repeats.
sched_rows.append(f'''<w:tr>
{cell([run("{{#payments}}{{milestone}}", sz=19, color=INK)], w=3600)}
{cell([run("{{trigger}}", sz=19)], w=3200)}
{cell([run("{{due}}", sz=19)], w=1200)}
{cell([run("{{amount}}{{/payments}}", sz=19)], w=1400, align="right")}
</w:tr>''')

sched = f'''<w:tbl>
<w:tblPr><w:tblW w:w="9400" w:type="dxa"/><w:tblBorders>
<w:top w:val="single" w:sz="4" w:color="E2DBD9"/>
<w:left w:val="none"/><w:right w:val="none"/>
<w:bottom w:val="single" w:sz="4" w:color="E2DBD9"/>
<w:insideH w:val="single" w:sz="4" w:color="E2DBD9"/>
<w:insideV w:val="none"/></w:tblBorders></w:tblPr>
<w:tblGrid><w:gridCol w:w="3600"/><w:gridCol w:w="3200"/><w:gridCol w:w="1200"/><w:gridCol w:w="1400"/></w:tblGrid>
{''.join(sched_rows)}
</w:tbl>'''
body.append(sched)
body.append(para([run("")], space_after=240))

# ---- Terms
body.append(para([run("4.  Payment terms", b=True, sz=26, color=INK)], space_after=140))
body.append(para(
    [run("Invoices are payable within ", sz=20), run("{{paymentTerms.days}}", sz=20, b=True),
     run(" days of receipt, in ", sz=20), run("{{paymentTerms.currency}}", sz=20, b=True),
     run(".", sz=20)],
    space_after=180))

# ---- Conditional clause: only rendered when the flag is truthy.
#
# The section wraps a heading *and* a paragraph, so the markers can't be folded into
# a single paragraph. They're emitted with zero spacing and a 1-twip exact line height
# instead, so once the section resolves they leave no visible gap behind — otherwise
# each marker costs a blank line in the output.
body.append(marker("{{#hasRetainer}}"))
body.append(para([run("5.  Retainer", b=True, sz=26, color=INK)], space_after=140))
body.append(para(
    [run("A monthly retainer of ", sz=20), run("{{retainerAmount}}", sz=20, b=True),
     run(" applies for the duration of this agreement.", sz=20)],
    space_after=60))
body.append(marker("{{/hasRetainer}}"))
body.append(para([run("")], space_after=240))

# ---- Signatures
body.append(para([run("Signatures", b=True, sz=26, color=INK)], space_before=240, space_after=200))

sig = f'''<w:tbl>
<w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblBorders>
<w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/>
<w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders></w:tblPr>
<w:tblGrid><w:gridCol w:w="4680"/><w:gridCol w:w="4680"/></w:tblGrid>
<w:tr>
{cell([run("_______________________________", sz=20, color=MUTED)], w=4680)}
{cell([run("_______________________________", sz=20, color=MUTED)], w=4680)}
</w:tr>
<w:tr>
{cell([run("{{provider.signatory}}", b=True, sz=19, color=INK)], w=4680)}
{cell([run("{{client.signatory}}", b=True, sz=19, color=INK)], w=4680)}
</w:tr>
<w:tr>
{cell([run("for {{provider.name}}", sz=17, color=MUTED)], w=4680)}
{cell([run("for {{client.name}}", sz=17, color=MUTED)], w=4680)}
</w:tr>
</w:tbl>'''
body.append(sig)

document = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document {W}><w:body>
{''.join(body)}
<w:sectPr>
<w:pgSz w:w="11906" w:h="16838"/>
<w:pgMar w:top="1417" w:right="1274" w:bottom="1417" w:left="1274" w:header="708" w:footer="708" w:gutter="0"/>
</w:sectPr>
</w:body></w:document>'''

content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>'''

root_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>'''

doc_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'''

styles = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles {W}>
<w:docDefaults><w:rPrDefault><w:rPr>
<w:rFonts w:ascii="Archivo" w:hAnsi="Archivo" w:eastAsia="Archivo" w:cs="Archivo"/>
<w:sz w:val="20"/><w:szCs w:val="20"/><w:color w:val="1A1414"/>
</w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>
</w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal">
<w:name w:val="Normal"/><w:qFormat/>
</w:style>
</w:styles>'''

core = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>Service Agreement Template</dc:title>
<dc:creator>Nutrient Office Templating Demo</dc:creator>
<cp:lastModifiedBy>Nutrient Office Templating Demo</cp:lastModifiedBy>
</cp:coreProperties>'''

app_props = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
<Application>Nutrient Office Templating Demo</Application>
</Properties>'''

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", content_types)
    z.writestr("_rels/.rels", root_rels)
    z.writestr("word/document.xml", document)
    z.writestr("word/_rels/document.xml.rels", doc_rels)
    z.writestr("word/styles.xml", styles)
    z.writestr("docProps/core.xml", core)
    z.writestr("docProps/app.xml", app_props)

print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")
