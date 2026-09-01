"""PresentationML authoring — text-box slides on a 16:9 stage.

Slides are absolutely positioned: PowerPoint has no flow layout, so every shape carries
an offset and extent in EMUs. 914400 EMU = 1 inch.
"""

import zipfile

from . import ACCENT, FONT, INK, MUTED, esc

A = "http://schemas.openxmlformats.org/drawingml/2006/main"
P = "http://schemas.openxmlformats.org/presentationml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

# 16:9 at 13.333 x 7.5 inches.
STAGE_W = 12192000
STAGE_H = 6858000

EMU_PER_INCH = 914400


def inches(value):
    return int(value * EMU_PER_INCH)


def textbox(name, x, y, w, h, paragraphs):
    """A text-box shape. ``paragraphs`` are pre-built <a:p> strings."""
    return (f'<p:sp><p:nvSpPr>'
            f'<p:cNvPr id="{abs(hash(name)) % 8000 + 2}" name="{esc(name)}"/>'
            f'<p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>'
            f'<p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{w}" cy="{h}"/></a:xfrm>'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>'
            f'<p:txBody><a:bodyPr wrap="square" rtlCol="0"><a:spAutoFit/></a:bodyPr>'
            f'<a:lstStyle/>{"".join(paragraphs)}</p:txBody></p:sp>')


def text(value, *, size=1800, bold=False, italic=False, color=INK, align="l",
         spacing_before=0):
    """One paragraph holding a single run — keeps a placeholder in one <a:t>."""
    emphasis = (' b="1"' if bold else "") + (' i="1"' if italic else "")

    rpr = (f'<a:rPr lang="en-US" sz="{size}"{emphasis} dirty="0">'
           f'<a:solidFill><a:srgbClr val="{color}"/></a:solidFill>'
           f'<a:latin typeface="{FONT}"/></a:rPr>')

    ppr = (f'<a:pPr algn="{align}"><a:spcBef>'
           f'<a:spcPts val="{spacing_before}"/></a:spcBef></a:pPr>')

    return f'<a:p>{ppr}<a:r>{rpr}<a:t>{esc(value)}</a:t></a:r></a:p>'


def runs(*parts, align="l", spacing_before=0):
    """A paragraph of several runs — for mixed emphasis on one line."""
    body = ""
    for value, opts in parts:
        size = opts.get("size", 1800)
        color = opts.get("color", INK)
        bold = ' b="1"' if opts.get("bold") else ""
        italic = ' i="1"' if opts.get("italic") else ""
        body += (f'<a:r><a:rPr lang="en-US" sz="{size}"{bold}{italic} dirty="0">'
                 f'<a:solidFill><a:srgbClr val="{color}"/></a:solidFill>'
                 f'<a:latin typeface="{FONT}"/></a:rPr>'
                 f'<a:t>{esc(value)}</a:t></a:r>')

    return (f'<a:p><a:pPr algn="{align}"><a:spcBef>'
            f'<a:spcPts val="{spacing_before}"/></a:spcBef></a:pPr>{body}</a:p>')


def blank():
    return '<a:p><a:endParaRPr lang="en-US"/></a:p>'


def slide(shapes):
    return (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<p:sld xmlns:a="{A}" xmlns:r="{R}" xmlns:p="{P}">'
            f'<p:cSld><p:spTree>'
            f'<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
            f'<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
            f'<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            f'{"".join(shapes)}'
            f'</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>')


# ------------------------------------------------------------------ packaging
# A minimal but valid deck needs a master, a layout, and a theme; PowerPoint refuses
# to open a presentation whose slides have no layout chain.

_THEME = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="{A}" name="Nutrient">
<a:themeElements>
<a:clrScheme name="Nutrient"><a:dk1><a:srgbClr val="{INK}"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
<a:dk2><a:srgbClr val="{MUTED}"/></a:dk2><a:lt2><a:srgbClr val="EFEBE7"/></a:lt2>
<a:accent1><a:srgbClr val="{ACCENT}"/></a:accent1><a:accent2><a:srgbClr val="DE9DCC"/></a:accent2>
<a:accent3><a:srgbClr val="6EB579"/></a:accent3><a:accent4><a:srgbClr val="F0C968"/></a:accent4>
<a:accent5><a:srgbClr val="C2B8AE"/></a:accent5><a:accent6><a:srgbClr val="67594B"/></a:accent6>
<a:hlink><a:srgbClr val="{ACCENT}"/></a:hlink><a:folHlink><a:srgbClr val="{MUTED}"/></a:folHlink></a:clrScheme>
<a:fontScheme name="Nutrient">
<a:majorFont><a:latin typeface="{FONT}"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>
<a:minorFont><a:latin typeface="{FONT}"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>
<a:fmtScheme name="Nutrient">
<a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
<a:lnStyleLst><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
<a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
<a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle>
<a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
</a:fmtScheme></a:themeElements></a:theme>"""

_MASTER = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="{A}" xmlns:r="{R}" xmlns:p="{P}">
<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
</p:spTree></p:cSld>
<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2"
 accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>"""

_LAYOUT = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="{A}" xmlns:r="{R}" xmlns:p="{P}" type="blank" preserve="1">
<p:cSld name="Blank"><p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>"""


def write(path, slides, *, doc_title):
    """Writes a .pptx package. ``slides`` are strings from :func:`slide`."""
    n = len(slides)

    sld_ids = "".join(
        f'<p:sldId id="{255 + i}" r:id="rId{i + 1}"/>' for i in range(1, n + 1))

    presentation = (
        f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<p:presentation xmlns:a="{A}" xmlns:r="{R}" xmlns:p="{P}">'
        f'<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>'
        f'<p:sldIdLst>{sld_ids}</p:sldIdLst>'
        f'<p:sldSz cx="{STAGE_W}" cy="{STAGE_H}"/>'
        f'<p:notesSz cx="{STAGE_H}" cy="{STAGE_W}"/>'
        f"</p:presentation>")

    # rId1 is the master; slides follow; the theme comes last.
    pres_rels = f'<Relationship Id="rId1" Type="{R}/slideMaster" Target="slideMasters/slideMaster1.xml"/>'
    pres_rels += "".join(
        f'<Relationship Id="rId{i + 1}" Type="{R}/slide" Target="slides/slide{i}.xml"/>'
        for i in range(1, n + 1))
    pres_rels += (f'<Relationship Id="rId{n + 2}" Type="{R}/theme" '
                  f'Target="theme/theme1.xml"/>')

    slide_overrides = "".join(
        f'<Override PartName="/ppt/slides/slide{i}.xml" '
        f'ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        for i in range(1, n + 1))

    content_types = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
{slide_overrides}
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>"""

    root_rels = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="{R}/officeDocument" Target="ppt/presentation.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>"""

    core = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:title>{esc(doc_title)}</dc:title>
<dc:creator>Nutrient Office Templating Demo</dc:creator>
</cp:coreProperties>"""

    def rels(entries):
        return (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                f'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                f"{entries}</Relationships>")

    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", root_rels)
        z.writestr("ppt/presentation.xml", presentation)
        z.writestr("ppt/_rels/presentation.xml.rels", rels(pres_rels))
        z.writestr("ppt/theme/theme1.xml", _THEME)
        z.writestr("ppt/slideMasters/slideMaster1.xml", _MASTER)
        z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", rels(
            f'<Relationship Id="rId1" Type="{R}/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'
            f'<Relationship Id="rId2" Type="{R}/theme" Target="../theme/theme1.xml"/>'))
        z.writestr("ppt/slideLayouts/slideLayout1.xml", _LAYOUT)
        z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", rels(
            f'<Relationship Id="rId1" Type="{R}/slideMaster" Target="../slideMasters/slideMaster1.xml"/>'))

        for i, body in enumerate(slides, start=1):
            z.writestr(f"ppt/slides/slide{i}.xml", body)
            z.writestr(f"ppt/slides/_rels/slide{i}.xml.rels", rels(
                f'<Relationship Id="rId1" Type="{R}/slideLayout" '
                f'Target="../slideLayouts/slideLayout1.xml"/>'))

        z.writestr("docProps/core.xml", core)

    return path
