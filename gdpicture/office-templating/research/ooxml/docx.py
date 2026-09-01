"""WordprocessingML authoring — paragraphs, tables, and a valid .docx package."""

import zipfile

from . import BAND, FONT, INK, MUTED, RULE, esc

W_NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'


def run(text, *, b=False, i=False, sz=None, color=None, font=FONT, caps=False):
    """One text run. A placeholder must sit in a single run to survive templating."""
    rpr = f'<w:rPr><w:rFonts w:ascii="{font}" w:hAnsi="{font}"/>'
    if b:
        rpr += "<w:b/>"
    if i:
        rpr += "<w:i/>"
    if caps:
        rpr += "<w:caps/>"
    if sz:
        rpr += f'<w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/>'
    if color:
        rpr += f'<w:color w:val="{color}"/>'
    rpr += "</w:rPr>"

    # xml:space="preserve" keeps the spaces that separate adjacent placeholders.
    return f'<w:r>{rpr}<w:t xml:space="preserve">{esc(text)}</w:t></w:r>'


def para(runs, *, align=None, after=120, before=0, indent=None, bullet=False):
    ppr = "<w:pPr>"
    if align:
        ppr += f'<w:jc w:val="{align}"/>'
    if indent or bullet:
        ppr += f'<w:ind w:left="{indent or 360}"/>'
    ppr += f'<w:spacing w:before="{before}" w:after="{after}"/></w:pPr>'

    body = "".join(runs)
    if bullet:
        # A literal bullet rather than a numbering definition: numbering.xml would need
        # its own part and relationship, and the marker is all the layout needs.
        body = run("•   ", color=MUTED) + body

    return f"<w:p>{ppr}{body}</w:p>"


def spacer(after=200):
    return para([run("")], after=after)


def section(name, runs_inside, *, inverted=False, **para_kwargs):
    """A section whose markers sit INSIDE one paragraph.

    Use this for prose — a conditional clause, or a repeat that should read as running
    text. The paragraph is emitted once and its *content* repeats, so entries run
    together inline; that is the right behaviour for a sentence, wrong for a list.

    For one paragraph per entry — a bullet list — use :func:`section_lines`.
    """
    sigil = "^" if inverted else "#"
    return para(
        [run(f"{{{{{sigil}{name}}}}}")] + list(runs_inside) + [run(f"{{{{/{name}}}}}")],
        **para_kwargs)


def section_lines(name, runs_inside, *, inverted=False, **para_kwargs):
    """A section that repeats a whole paragraph — one line per entry.

    The markers have to wrap the paragraph rather than sit inside it, otherwise the
    entries concatenate onto a single line. That does mean a marker-only paragraph at
    each end, so both are emitted with zero spacing and no line height: once the
    section resolves they collapse to nothing visible instead of leaving the ragged
    gaps that marker paragraphs otherwise cause.
    """
    sigil = "^" if inverted else "#"
    return "".join([
        _marker_para(f"{{{{{sigil}{name}}}}}"),
        para(list(runs_inside), **para_kwargs),
        _marker_para(f"{{{{/{name}}}}}"),
    ])


def _marker_para(text):
    """A paragraph holding only a section marker, squeezed to nothing.

    Zero spacing before and after, and an exact 1-twip line height, so the leftover
    paragraph contributes no visible space to the finished document.

    The trade-off is that the marker text overlaps whatever follows it when the
    *template* is viewed unresolved — the line box is 1 twip but the glyphs are not.
    It's rendered tiny and muted to keep that legible rather than a smear; in generated
    output the paragraph is empty, so none of this shows.
    """
    return (f'<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="1" '
            f'w:lineRule="exact"/></w:pPr>{run(text, sz=2, color=RULE)}</w:p>')


def section_open(name, *, inverted=False):
    """Opening marker for a section spanning several block-level elements.

    Needed when a section wraps a whole table or a heading plus its own nested list,
    where the markers can't live in one paragraph.
    """
    sigil = "^" if inverted else "#"
    return _marker_para(f"{{{{{sigil}{name}}}}}")


def section_close(name):
    return _marker_para(f"{{{{/{name}}}}}")


def heading(text, *, level=1, after=140, before=240):
    """Section heading. Level 1 is a numbered section, 2 a sub-heading."""
    size = {1: 26, 2: 22}.get(level, 20)
    return para([run(text, b=True, sz=size, color=INK)], after=after, before=before)


def title(text, *, sub_runs=None):
    out = [para([run(text, b=True, sz=40, color=INK)], after=40)]
    if sub_runs:
        out.append(para(sub_runs, after=320))
    return "".join(out)


def cell(runs, *, w=2400, align=None, shade=None, valign="center", span=None, after=60):
    tcpr = f'<w:tcPr><w:tcW w:w="{w}" w:type="dxa"/>'
    if span:
        tcpr += f'<w:gridSpan w:val="{span}"/>'
    if shade:
        tcpr += f'<w:shd w:val="clear" w:color="auto" w:fill="{shade}"/>'
    tcpr += f'<w:vAlign w:val="{valign}"/></w:tcPr>'

    return f"<w:tc>{tcpr}{para(runs, align=align, after=after)}</w:tc>"


def row(cells, *, header=False):
    trpr = "<w:trPr><w:tblHeader/></w:trPr>" if header else ""
    return f"<w:tr>{trpr}{''.join(cells)}</w:tr>"


def table(rows, widths, *, borders=True, width=None):
    """A table. ``widths`` sizes the grid columns in twentieths of a point."""
    if borders:
        edge = f'<w:top w:val="single" w:sz="4" w:color="{RULE}"/>' \
               f'<w:bottom w:val="single" w:sz="4" w:color="{RULE}"/>' \
               f'<w:insideH w:val="single" w:sz="4" w:color="{RULE}"/>' \
               '<w:left w:val="none"/><w:right w:val="none"/><w:insideV w:val="none"/>'
    else:
        edge = ('<w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/>'
                '<w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/>')

    grid = "".join(f'<w:gridCol w:w="{w}"/>' for w in widths)

    return (f'<w:tbl><w:tblPr><w:tblW w:w="{width or sum(widths)}" w:type="dxa"/>'
            f"<w:tblBorders>{edge}</w:tblBorders></w:tblPr>"
            f"<w:tblGrid>{grid}</w:tblGrid>{''.join(rows)}</w:tbl>")


def loop_row(name, cells_runs, widths, *, aligns=None):
    """A table row that repeats per entry in ``name``.

    The section opens in the first cell and closes in the last, so the whole ``<w:tr>``
    is what repeats. This is the pattern the Nutrient invoice fixture uses, and the
    only one that works for tables — markers in their own row would leave empty rows
    behind.

    ``cells_runs`` is a list of run-lists, one per column.
    """
    aligns = aligns or [None] * len(cells_runs)
    body = [list(runs_for_cell) for runs_for_cell in cells_runs]

    body[0].insert(0, run(f"{{{{#{name}}}}}"))
    body[-1].append(run(f"{{{{/{name}}}}}"))

    return row([cell(runs_for_cell, w=width, align=align)
                for runs_for_cell, width, align in zip(body, widths, aligns)])


def header_row(labels, widths, *, aligns=None):
    """A shaded, repeating header row for a data table."""
    aligns = aligns or [None] * len(labels)
    return row(
        [cell([run(label, b=True, sz=17, color=MUTED, caps=True)],
              w=width, shade=BAND, align=align)
         for label, width, align in zip(labels, widths, aligns)],
        header=True)


def two_column(left_runs, right_runs, *, width=9360):
    """A borderless two-up block — parties, signatories, address pairs."""
    half = width // 2
    return table(
        [row([cell(l, w=half, valign="top"), cell(r, w=half, valign="top")])
         for l, r in zip(left_runs, right_runs)],
        [half, half], borders=False, width=width)


def signature_block(left_name, left_org, right_name, right_org):
    rule = "_______________________________"
    return two_column(
        [[run(rule, sz=20, color=MUTED)],
         [run(left_name, b=True, sz=19, color=INK)],
         [run(left_org, sz=17, color=MUTED)]],
        [[run(rule, sz=20, color=MUTED)],
         [run(right_name, b=True, sz=19, color=INK)],
         [run(right_org, sz=17, color=MUTED)]])


# ------------------------------------------------------------------ packaging

_CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>"""

_ROOT_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""

_DOC_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

_STYLES = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles {W_NS}>
<w:docDefaults><w:rPrDefault><w:rPr>
<w:rFonts w:ascii="{FONT}" w:hAnsi="{FONT}" w:eastAsia="{FONT}" w:cs="{FONT}"/>
<w:sz w:val="20"/><w:szCs w:val="20"/><w:color w:val="{INK}"/>
</w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>
</w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
</w:styles>"""

# A4 with ~2.2cm margins.
_SECT = ('<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
         '<w:pgMar w:top="1417" w:right="1274" w:bottom="1417" w:left="1274" '
         'w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>')


def write(path, body, *, doc_title):
    """Writes a complete .docx package. ``body`` is a list of block-level XML strings."""
    document = (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                f'<w:document {W_NS}><w:body>{"".join(body)}{_SECT}</w:body></w:document>')

    core = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>{esc(doc_title)}</dc:title>
<dc:creator>Nutrient Office Templating Demo</dc:creator>
<cp:lastModifiedBy>Nutrient Office Templating Demo</cp:lastModifiedBy>
</cp:coreProperties>"""

    app = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
<Application>Nutrient Office Templating Demo</Application>
</Properties>"""

    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", _CONTENT_TYPES)
        z.writestr("_rels/.rels", _ROOT_RELS)
        z.writestr("word/document.xml", document)
        z.writestr("word/_rels/document.xml.rels", _DOC_RELS)
        z.writestr("word/styles.xml", _STYLES)
        z.writestr("docProps/core.xml", core)
        z.writestr("docProps/app.xml", app)

    return path
