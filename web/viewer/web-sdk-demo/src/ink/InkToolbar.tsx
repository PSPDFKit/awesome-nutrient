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
import { getFirstSelectedAnnotation } from '../lib/selection'
import type { SDKInstance } from '../types/global'

const COLORS: string[] = [
  // Row 1
  '#000000', '#ffffff', '#e15a2c', '#f19034', '#b7d641', '#5dcae7', '#b7ccd2', '#c8afe0', '#f2bfaf',
  // Row 2
  '#f4d33b', '#931f31', '#b66024', '#225342', '#2a6f8e', '#1f2c45', '#5b2954', '#bc2f6e', '#b4682a',
]

const WIDTHS: { id: string; label: string; value: number }[] = [
  { id: 'thin', label: 'Thin', value: 1 },
  { id: 'medium', label: 'Medium', value: 3 },
  { id: 'thick', label: 'Thick', value: 5 },
]

type Props = {
  instance: SDKInstance | null
  onClose: () => void
}

export function InkToolbar({ instance, onClose }: Props) {
  const [color, setColor] = useState<string>('#f4d33b')
  const [widthId, setWidthId] = useState<string>('medium')
  // `null` until we've measured the viewer + toolbar and computed the centered
  // position. Rendered hidden during that single layout pass to avoid a flash
  // at the top-left.
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [colorOpen, setColorOpen] = useState(false)
  const [widthOpen, setWidthOpen] = useState(false)
  const dragRef = useRef<{ dx: number; dy: number } | null>(null)
  const toolbarRef = useRef<HTMLDivElement | null>(null)

  // Position the toolbar inside the `.app-viewer` area, vertically centered
  // and tucked against its left edge. Runs once before paint so the user
  // doesn't see it flash at the top-left first.
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

  // Push our color/width into the SDK's ink preset whenever it changes.
  useEffect(() => {
    if (!instance) return
    try {
      const newStrokeColor = buildSDKColor(color)
      if (!newStrokeColor) return
      const lineWidth = WIDTHS.find((w) => w.id === widthId)?.value ?? 3

      // 1. Update the `ink` preset so future ink annotations are created with
      //    these values.
      instance.setAnnotationPresets((presets) => ({
        ...presets,
        ink: {
          ...presets.ink,
          strokeColor: newStrokeColor,
          lineWidth,
        },
      }))

      // 2. The in-progress ghost annotation that's currently selected was
      //    built from the preset *at the moment ink mode was entered*. Its
      //    strokeColor / lineWidth do not auto-update when the preset changes,
      //    so we push the new values onto it directly — but only while it's
      //    still pristine (no strokes drawn yet). Once strokes exist the
      //    annotation is effectively committed; mutating it would re-color
      //    drawings the user has already made. The next stroke will start a
      //    fresh annotation that picks up the updated preset. Mirrors the
      //    SDK's own `InkAnnotationToolbarComponent` behaviour.
      const selected = getFirstSelectedAnnotation(instance.getSelectedAnnotations?.())
      if (isPristineInkAnnotation(selected)) {
        const updated = selected
          .set('strokeColor', newStrokeColor)
          .set('lineWidth', lineWidth)
        void instance.update(updated)
      }
    } catch (err) {
      console.warn('Could not update ink preset', err)
    }
  }, [instance, color, widthId])

  // Enter ink mode on mount, exit on close. The SDK's contextual annotation
  // toolbar is suppressed by `NutrientViewer`'s `hideContextualToolbar` prop
  // (driven by `inkOpen` in App.tsx) so we don't blow away the rest of the UI
  // customization here.
  //
  // `setCurrentAnnotationPreset('ink')` points the SDK at the `ink` preset
  // when it builds the in-progress annotation. Without this, `currentItemPreset`
  // stays `null` and the SDK falls back to model defaults — so our preset
  // updates (color, lineWidth) never reach the new annotation.
  useEffect(() => {
    if (!instance) return
    const sdk = window.NutrientViewer
    if (!sdk) return
    instance.setCurrentAnnotationPreset('ink')
    instance.setViewState((vs) => vs.set('interactionMode', sdk.InteractionMode.INK))
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
      // back into INK so the user can keep drawing.
      const sdk = window.NutrientViewer
      if (sdk) {
        instance.setViewState((vs) => vs.set('interactionMode', sdk.InteractionMode.INK))
      }
    } catch (err) {
      console.warn('Undo failed', err)
    }
  }, [instance])

  const deleteAllInkOnPage = useCallback(async () => {
    if (!instance) return
    try {
      const pageIndex = instance.viewState.currentPageIndex
      const list = await instance.getAnnotations(pageIndex)
      const inkIds = list
        .toArray()
        .filter((a) => a.constructor?.name === 'InkAnnotation')
        .map((a) => a.id)
      if (inkIds.length > 0) await instance.delete(inkIds)
      // Deleting clears the active interactionMode — pop us back into INK
      // so the user can keep drawing without re-clicking the sidebar toggle.
      const sdk = window.NutrientViewer
      if (sdk) {
        instance.setViewState((vs) => vs.set('interactionMode', sdk.InteractionMode.INK))
      }
    } catch (err) {
      console.warn('Delete-all failed', err)
    }
  }, [instance])

  // Drag-to-reposition the toolbar by its grip handle.
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
      className="ink-toolbar"
      style={
        position
          ? { left: position.x, top: position.y }
          : { visibility: 'hidden', left: 0, top: 0 }
      }
      role="toolbar"
      aria-label="Ink drawing tools"
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

      <Tooltip text="Delete drawings on page" placement="right" delay={300} closeDelay={100}>
        <Focusable>
          <button
            type="button"
            className="ink-btn"
            onClick={deleteAllInkOnPage}
            disabled={disabled}
            aria-label="Delete drawings"
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
              aria-label="Select drawing color"
              aria-haspopup="dialog"
              aria-expanded={colorOpen}
              title="Select drawing color"
              onClick={() => setColorOpen((v) => !v)}
            >
              <ColorWheelIcon />
              <span className="ink-btn__color-dot" style={{ background: color }} />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent placement="right">
          <div className="ink-popover ink-popover--colors">
            <div className="ink-popover__title">Select drawing color</div>
            <div className="color-grid">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`color-swatch${color === c ? ' color-swatch--active' : ''}`}
                  style={{ background: c }}
                  onClick={() => {
                    setColor(c)
                    setColorOpen(false)
                  }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover type="dialog" isOpen={widthOpen} onOpenChange={setWidthOpen}>
        <PopoverTrigger>
          {({ triggerRef }) => (
            <button
              ref={triggerRef as React.RefObject<HTMLButtonElement>}
              type="button"
              className="ink-btn"
              aria-label="Stroke width"
              aria-haspopup="dialog"
              aria-expanded={widthOpen}
              title="Stroke width"
              onClick={() => setWidthOpen((v) => !v)}
            >
              <StrokeIcon />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent placement="right">
          <div className="ink-popover">
            {WIDTHS.map((w) => (
              <button
                type="button"
                key={w.id}
                className={`stroke-option${widthId === w.id ? ' stroke-option--active' : ''}`}
                onClick={() => {
                  setWidthId(w.id)
                  setWidthOpen(false)
                }}
                aria-label={`${w.label} stroke`}
              >
                <span
                  className="stroke-option__bar"
                  style={{ height: w.value, width: 36 - w.value * 4 }}
                />
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
            aria-label="Close ink toolbar"
          >
            <CloseIcon />
          </button>
        </Focusable>
      </Tooltip>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────

function ColorWheelIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="cw-1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="100%" stopColor="#ffb84d" />
        </linearGradient>
        <linearGradient id="cw-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb84d" />
          <stop offset="100%" stopColor="#fff04d" />
        </linearGradient>
        <linearGradient id="cw-3" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a3ff4d" />
          <stop offset="100%" stopColor="#4dffb1" />
        </linearGradient>
        <linearGradient id="cw-4" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#4dc4ff" />
          <stop offset="100%" stopColor="#4d6cff" />
        </linearGradient>
        <linearGradient id="cw-5" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#a14dff" />
          <stop offset="100%" stopColor="#ff4dd2" />
        </linearGradient>
      </defs>
      <path d="M12 2 A10 10 0 0 1 22 12 L12 12 Z" fill="url(#cw-1)" />
      <path d="M22 12 A10 10 0 0 1 17 20.66 L12 12 Z" fill="url(#cw-2)" />
      <path d="M17 20.66 A10 10 0 0 1 7 20.66 L12 12 Z" fill="url(#cw-3)" />
      <path d="M7 20.66 A10 10 0 0 1 2 12 L12 12 Z" fill="url(#cw-4)" />
      <path d="M2 12 A10 10 0 0 1 12 2 L12 12 Z" fill="url(#cw-5)" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="0.5" />
    </svg>
  )
}

function StrokeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden>
      <line x1="4" y1="6" x2="18" y2="6" strokeWidth="1.5" />
      <line x1="4" y1="11" x2="18" y2="11" strokeWidth="2.5" />
      <line x1="4" y1="16" x2="18" y2="16" strokeWidth="3.5" />
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────

type InProgressInkAnnotation = {
  set: (key: string, value: unknown) => InProgressInkAnnotation
  constructor: { name: string }
  lines?: { size: number }
}

// "Pristine" = an InkAnnotation that hasn't been drawn into yet. The SDK
// keeps such a ghost selected after entering ink mode and after each stroke
// is committed, so it's safe to mutate. Once `lines.size > 0` the annotation
// represents the user's actual drawing — mutating it would re-color
// already-finished strokes.
function isPristineInkAnnotation(value: unknown): value is InProgressInkAnnotation {
  if (!value || typeof value !== 'object') return false
  const candidate = value as InProgressInkAnnotation
  if (candidate.constructor?.name !== 'InkAnnotation') return false
  if (typeof candidate.set !== 'function') return false
  const linesSize = candidate.lines?.size
  return linesSize == null || linesSize === 0
}
