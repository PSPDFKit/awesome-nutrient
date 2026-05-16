import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Focusable,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@baseline-ui/core'
import { buildSDKColor } from '../lib/color'
import { CloseIcon, GripIcon, TrashIcon, UndoIcon } from '../lib/icons'
import { getFirstSelectedAnnotation, getSelectionSize } from '../lib/selection'
import type { SDKInstance } from '../types/global'

const COLORS: string[] = [
  // Row 1
  '#000000', '#ffffff', '#e15a2c', '#f19034', '#b7d641', '#5dcae7', '#b7ccd2', '#c8afe0', '#f2bfaf',
  // Row 2
  '#f4d33b', '#931f31', '#b66024', '#225342', '#2a6f8e', '#1f2c45', '#5b2954', '#bc2f6e', '#b4682a',
]

const FONT_SIZES: { id: string; label: string; value: number }[] = [
  { id: 'sm', label: 'Small', value: 12 },
  { id: 'md', label: 'Medium', value: 18 },
  { id: 'lg', label: 'Large', value: 36 },
]

type Align = 'left' | 'center' | 'right'

const ALIGNMENTS: { id: Align; label: string }[] = [
  { id: 'left', label: 'Align left' },
  { id: 'center', label: 'Align center' },
  { id: 'right', label: 'Align right' },
]

type Props = {
  instance: SDKInstance | null
  onClose: () => void
}

export function TextToolbar({ instance, onClose }: Props) {
  const [color, setColor] = useState<string>('#ffffff')
  const [fontSizeId, setFontSizeId] = useState<string>('md')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [align, setAlign] = useState<Align>('left')
  // `null` until we've measured the viewer + toolbar. Hidden during the
  // single layout pass to avoid a flash at top-left.
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [colorOpen, setColorOpen] = useState(false)
  const [sizeOpen, setSizeOpen] = useState(false)
  const [alignOpen, setAlignOpen] = useState(false)
  const dragRef = useRef<{ dx: number; dy: number } | null>(null)
  const toolbarRef = useRef<HTMLDivElement | null>(null)

  // Position the toolbar inside the `.app-viewer` area, vertically centered
  // and tucked against its left edge.
  useLayoutEffect(() => {
    const viewer = document.querySelector('.app-viewer') as HTMLElement | null
    const toolbar = toolbarRef.current
    if (!viewer || !toolbar) return
    const viewerRect = viewer.getBoundingClientRect()
    const toolbarRect = toolbar.getBoundingClientRect()
    setPosition({
      x: viewerRect.left + 16,
      y: viewerRect.top + (viewerRect.height - toolbarRect.height) / 2,
    })
  }, [])

  // Keep the `text` preset in sync so newly-placed text annotations pick up
  // the current toolbar values. Annotation/editor-selection updates happen
  // in the per-property handlers (apply* below), not here — pushing all
  // properties on every state change would re-assert e.g. bold=false when
  // the user only changed color, clobbering the editor's sub-selection.
  useEffect(() => {
    if (!instance) return
    try {
      const fontColor = buildSDKColor(color)
      if (!fontColor) return
      const fontSize = FONT_SIZES.find((s) => s.id === fontSizeId)?.value ?? 18

      instance.setAnnotationPresets((presets) => ({
        ...presets,
        text: {
          ...presets.text,
          fontColor,
          fontSize,
          isBold,
          isItalic,
          horizontalAlign: align,
        },
      }))
    } catch (err) {
      console.warn('Could not update text preset', err)
    }
  }, [instance, color, fontSizeId, isBold, isItalic, align])

  // Per-property handlers: update local state AND push to the SDK editor
  // namespace so the change reaches the rich-text editor's current text
  // selection (Slate transforms) when in EDITING mode, or the annotation
  // model when only SELECTED. Each handler is the user's explicit intent —
  // we only push the property they actually changed.
  const applyColor = useCallback(
    (next: string) => {
      setColor(next)
      if (!instance) return
      const textApi = instance.annotations?.text
      if (!textApi) return
      if (!hasSingleTextAnnotationSelected(instance)) return
      const fontColor = buildSDKColor(next)
      if (fontColor) safeCall(() => textApi.setFontColor(fontColor))
    },
    [instance],
  )

  const applyFontSize = useCallback(
    (nextId: string) => {
      setFontSizeId(nextId)
      if (!instance) return
      const textApi = instance.annotations?.text
      if (!textApi) return
      if (!hasSingleTextAnnotationSelected(instance)) return
      const value = FONT_SIZES.find((s) => s.id === nextId)?.value
      if (typeof value === 'number') safeCall(() => textApi.setFontSize(value))
    },
    [instance],
  )

  const applyBold = useCallback(
    (next: boolean) => {
      setIsBold(next)
      if (!instance) return
      const textApi = instance.annotations?.text
      if (!textApi) return
      if (!hasSingleTextAnnotationSelected(instance)) return
      safeCall(() => textApi.setTextStyle({ bold: next }))
    },
    [instance],
  )

  const applyItalic = useCallback(
    (next: boolean) => {
      setIsItalic(next)
      if (!instance) return
      const textApi = instance.annotations?.text
      if (!textApi) return
      if (!hasSingleTextAnnotationSelected(instance)) return
      safeCall(() => textApi.setTextStyle({ italic: next }))
    },
    [instance],
  )

  // `horizontalAlign` isn't in the editor namespace — it's a per-annotation
  // property (not per-character), so we update the model directly.
  const applyAlign = useCallback(
    (next: Align) => {
      setAlign(next)
      if (!instance) return
      const selected = getFirstSelectedAnnotation(instance.getSelectedAnnotations?.())
      if (isTextAnnotation(selected) && selected.horizontalAlign !== next) {
        void instance.update(selected.set('horizontalAlign', next))
      }
    },
    [instance],
  )

  // Enter TEXT mode on mount, exit on close. The contextual annotation
  // toolbar is suppressed by `NutrientViewer`'s `hideContextualToolbar` prop
  // (driven by `textOpen` in App.tsx).
  //
  // `setCurrentAnnotationPreset('text')` points the SDK at the `text` preset
  // so our preset updates reach newly placed annotations.
  useEffect(() => {
    if (!instance) return
    const sdk = window.NutrientViewer
    if (!sdk) return
    instance.setCurrentAnnotationPreset('text')
    instance.setViewState((vs) => vs.set('interactionMode', sdk.InteractionMode.TEXT))
    return () => {
      instance.setViewState((vs) => vs.set('interactionMode', null))
      instance.setCurrentAnnotationPreset(null)
    }
  }, [instance])

  const undo = useCallback(async () => {
    if (!instance) return
    try {
      await instance.history.undo()
      // Undo (like delete) clears the active interactionMode, so put us
      // back into TEXT so the user can keep adding text.
      const sdk = window.NutrientViewer
      if (sdk) {
        instance.setViewState((vs) => vs.set('interactionMode', sdk.InteractionMode.TEXT))
      }
    } catch (err) {
      console.warn('Undo failed', err)
    }
  }, [instance])

  const deleteAllTextOnPage = useCallback(async () => {
    if (!instance) return
    try {
      const pageIndex = instance.viewState.currentPageIndex
      const list = await instance.getAnnotations(pageIndex)
      const textIds = list
        .toArray()
        .filter((a) => a.constructor?.name === 'TextAnnotation')
        .map((a) => a.id)
      if (textIds.length > 0) await instance.delete(textIds)
      const sdk = window.NutrientViewer
      if (sdk) {
        instance.setViewState((vs) => vs.set('interactionMode', sdk.InteractionMode.TEXT))
      }
    } catch (err) {
      console.warn('Delete-all failed', err)
    }
  }, [instance])

  const onGripPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!position) return
    e.preventDefault()
    dragRef.current = {
      dx: e.clientX - position.x,
      dy: e.clientY - position.y,
    }
    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current) return
      setPosition({ x: ev.clientX - dragRef.current.dx, y: ev.clientY - dragRef.current.dy })
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const disabled = !instance

  return (
    <div
      ref={toolbarRef}
      className="ink-toolbar text-toolbar"
      style={
        position
          ? { left: position.x, top: position.y }
          : { visibility: 'hidden', left: 0, top: 0 }
      }
      role="toolbar"
      aria-label="Text annotation tools"
    >
      <div
        className="ink-toolbar__grip"
        onPointerDown={onGripPointerDown}
        aria-label="Drag to move"
      >
        <GripIcon />
      </div>

      <Tooltip text="Undo" placement="right" delay={300} closeDelay={100}>
        <Focusable>
          <button
            type="button"
            className="ink-btn"
            onClick={undo}
            disabled={disabled}
            aria-label="Undo"
          >
            <UndoIcon />
          </button>
        </Focusable>
      </Tooltip>

      <Tooltip text="Delete text on page" placement="right" delay={300} closeDelay={100}>
        <Focusable>
          <button
            type="button"
            className="ink-btn"
            onClick={deleteAllTextOnPage}
            disabled={disabled}
            aria-label="Delete text"
          >
            <TrashIcon />
          </button>
        </Focusable>
      </Tooltip>

      <Popover type="dialog" isOpen={colorOpen} onOpenChange={setColorOpen}>
        <PopoverTrigger>
          {({ triggerRef }) => (
            <button
              ref={triggerRef as React.RefObject<HTMLButtonElement>}
              type="button"
              className="ink-btn ink-btn--color"
              aria-label="Select font color"
              aria-haspopup="dialog"
              aria-expanded={colorOpen}
              title="Select font color"
              onClick={() => setColorOpen((v) => !v)}
            >
              <FontColorIcon />
              <span className="ink-btn__color-dot" style={{ background: color }} />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent placement="right">
          <div className="ink-popover ink-popover--colors">
            <div className="ink-popover__title">Select font color</div>
            <div className="color-grid">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`color-swatch${color === c ? ' color-swatch--active' : ''}`}
                  style={{ background: c }}
                  onClick={() => {
                    applyColor(c)
                    setColorOpen(false)
                  }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover type="dialog" isOpen={sizeOpen} onOpenChange={setSizeOpen}>
        <PopoverTrigger>
          {({ triggerRef }) => (
            <button
              ref={triggerRef as React.RefObject<HTMLButtonElement>}
              type="button"
              className="ink-btn"
              aria-label="Font size"
              aria-haspopup="dialog"
              aria-expanded={sizeOpen}
              title="Font size"
              onClick={() => setSizeOpen((v) => !v)}
            >
              <FontSizeIcon />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent placement="right">
          <div className="ink-popover">
            {FONT_SIZES.map((s) => (
              <button
                type="button"
                key={s.id}
                className={`stroke-option text-size-option${fontSizeId === s.id ? ' stroke-option--active' : ''}`}
                onClick={() => {
                  applyFontSize(s.id)
                  setSizeOpen(false)
                }}
                aria-label={`${s.label} font`}
              >
                <span className="text-size-option__label">A</span>
                <span className="text-size-option__value">{s.value}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Tooltip text="Bold" placement="right" delay={300} closeDelay={100}>
        <Focusable>
          <button
            type="button"
            className={`ink-btn${isBold ? ' ink-btn--active' : ''}`}
            onClick={() => applyBold(!isBold)}
            disabled={disabled}
            aria-label="Bold"
            aria-pressed={isBold}
          >
            <BoldIcon />
          </button>
        </Focusable>
      </Tooltip>

      <Tooltip text="Italic" placement="right" delay={300} closeDelay={100}>
        <Focusable>
          <button
            type="button"
            className={`ink-btn${isItalic ? ' ink-btn--active' : ''}`}
            onClick={() => applyItalic(!isItalic)}
            disabled={disabled}
            aria-label="Italic"
            aria-pressed={isItalic}
          >
            <ItalicIcon />
          </button>
        </Focusable>
      </Tooltip>

      <Popover type="dialog" isOpen={alignOpen} onOpenChange={setAlignOpen}>
        <PopoverTrigger>
          {({ triggerRef }) => (
            <button
              ref={triggerRef as React.RefObject<HTMLButtonElement>}
              type="button"
              className="ink-btn"
              aria-label="Text alignment"
              aria-haspopup="dialog"
              aria-expanded={alignOpen}
              title="Text alignment"
              onClick={() => setAlignOpen((v) => !v)}
            >
              <AlignIcon align={align} />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent placement="right">
          <div className="ink-popover">
            {ALIGNMENTS.map((a) => (
              <button
                type="button"
                key={a.id}
                className={`stroke-option${align === a.id ? ' stroke-option--active' : ''}`}
                onClick={() => {
                  applyAlign(a.id)
                  setAlignOpen(false)
                }}
                aria-label={a.label}
              >
                <AlignIcon align={a.id} />
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Tooltip text="Close" placement="right" delay={300} closeDelay={100}>
        <Focusable>
          <button
            type="button"
            className="ink-btn"
            onClick={onClose}
            aria-label="Close text toolbar"
          >
            <CloseIcon />
          </button>
        </Focusable>
      </Tooltip>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────

function FontColorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 17 12 5l6 12M8.5 13h7" />
    </svg>
  )
}

function FontSizeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 18 8 6l5 12M4.5 14h7M14 18l4-9 4 9M15 15h6" />
    </svg>
  )
}

function BoldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 4h5a3 3 0 0 1 0 6H6zM6 10h6a3 3 0 0 1 0 6H6z" />
    </svg>
  )
}

function ItalicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 4h7M4 16h7M12 4 8 16" />
    </svg>
  )
}

function AlignIcon({ align }: { align: Align }) {
  const lines: Record<Align, string> = {
    left: 'M3 5h14M3 9h10M3 13h14M3 17h8',
    center: 'M3 5h14M5 9h10M3 13h14M6 17h8',
    right: 'M3 5h14M7 9h10M3 13h14M9 17h8',
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={lines[align]} />
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────

type SettableTextAnnotation = {
  set: (key: string, value: unknown) => SettableTextAnnotation
  constructor: { name: string }
  horizontalAlign?: Align
}

function hasSingleTextAnnotationSelected(instance: SDKInstance): boolean {
  const selection = instance.getSelectedAnnotations?.()
  if (getSelectionSize(selection) !== 1) return false
  return isTextAnnotation(getFirstSelectedAnnotation(selection))
}

function isTextAnnotation(value: unknown): value is SettableTextAnnotation {
  if (!value || typeof value !== 'object') return false
  const candidate = value as SettableTextAnnotation
  return candidate.constructor?.name === 'TextAnnotation' && typeof candidate.set === 'function'
}

function safeCall(fn: () => void) {
  try {
    fn()
  } catch (err) {
    console.warn('text-annotation editor command failed', err)
  }
}
