import React, { useEffect, useState, type ReactNode } from 'react'
import {
  ActionButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@baseline-ui/core'
import { CaretIcon } from './lib/icons'
import type { SDKInstance } from './types/global'
import type { SavedSignature } from './signing/storage'

type Props = {
  instance: SDKInstance | null
  fileName: string | null
  savedSignatures: SavedSignature[]
  onGetSignatures: () => void
  onPickSignature: (sig: SavedSignature) => void
  onEditSignatures: () => void
}

export function Toolbar({
  instance,
  fileName,
  savedSignatures,
  onGetSignatures,
  onPickSignature,
  onEditSignatures,
}: Props) {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const [signMenuOpen, setSignMenuOpen] = useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)

  const syncPageState = () => {
    if (!instance) return
    const nextPageCount = instance.totalPageCount
    const nextPageIndex = Math.min(
      instance.viewState.currentPageIndex,
      Math.max(nextPageCount - 1, 0),
    )
    setPageIndex(nextPageIndex)
    setPageCount(nextPageCount)
    setZoom(instance.currentZoomLevel ?? 1)
    setPageInput(String(nextPageIndex + 1))
  }

  useEffect(() => {
    if (!instance) {
      setPageIndex(0)
      setPageCount(0)
      setZoom(1)
      setPageInput('1')
      setOperationError(null)
      return
    }

    syncPageState()

    const onViewState = (vs: unknown) => {
      const state = vs as SDKInstance['viewState']
      const nextPageIndex = Math.min(
        state.currentPageIndex,
        Math.max(instance.totalPageCount - 1, 0),
      )
      setPageIndex(nextPageIndex)
      setPageCount(instance.totalPageCount)
      setPageInput(String(nextPageIndex + 1))
    }
    const onZoom = (z: unknown) => setZoom(z as number)

    instance.addEventListener('viewState.change', onViewState)
    instance.addEventListener('viewState.zoom.change', onZoom)
    return () => {
      instance.removeEventListener('viewState.change', onViewState)
      instance.removeEventListener('viewState.zoom.change', onZoom)
    }
  }, [instance])

  useEffect(() => {
    if (!operationError) return
    const timeout = window.setTimeout(() => setOperationError(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [operationError])

  const apply = (transform: (vs: SDKInstance['viewState']) => SDKInstance['viewState']) => {
    if (!instance) return
    instance.setViewState(transform)
  }

  const setMode = (mode: unknown) =>
    apply((vs) => vs.set('interactionMode', mode))

  const goToPage = (oneBasedPage: number) => {
    if (!instance) return
    const target = Math.max(1, Math.min(pageCount, oneBasedPage)) - 1
    apply((vs) => vs.set('currentPageIndex', target))
  }

  const zoomIn = () => apply((vs) => vs.zoomIn())
  const zoomOut = () => apply((vs) => vs.zoomOut())
  const fitWidth = () =>
    apply((vs) => vs.set('zoom', window.NutrientViewer!.ZoomMode.FIT_TO_WIDTH))

  const runOperation = async (
    label: string,
    operation: (viewer: SDKInstance) => Promise<unknown>,
    refreshPages = true,
  ) => {
    if (!instance) return false
    setOperationError(null)
    try {
      await operation(instance)
      if (refreshPages) syncPageState()
      return true
    } catch (err) {
      console.error(`${label} failed`, err)
      setOperationError(`${label} failed`)
      return false
    }
  }

  const rotatePages = (rotateBy: 90 | -90) => {
    return runOperation('Rotate page', (viewer) =>
      viewer.applyOperations([
        { type: 'rotatePages', pageIndexes: [pageIndex], rotateBy },
      ]),
    )
  }
  const deletePage = () => {
    if (pageCount <= 1) return
    return runOperation('Delete page', (viewer) =>
      viewer.applyOperations([
        { type: 'removePages', pageIndexes: [pageIndex] },
      ]),
    )
  }
  const addPage = () => {
    return runOperation('Add page', (viewer) =>
      viewer.applyOperations([
        {
          type: 'addPage',
          afterPageIndex: pageIndex,
          backgroundColor: window.NutrientViewer!.Color
            ? new (window.NutrientViewer!.Color as new (...args: unknown[]) => unknown)({
                r: 255,
                g: 255,
                b: 255,
              })
            : undefined,
        },
      ]),
    )
  }

  const search = () => setMode(window.NutrientViewer!.InteractionMode.SEARCH)
  const draw = () => setMode(window.NutrientViewer!.InteractionMode.INK)
  const highlight = () =>
    setMode(window.NutrientViewer!.InteractionMode.TEXT_HIGHLIGHTER)
  const addText = () => setMode(window.NutrientViewer!.InteractionMode.TEXT)
  const editText = () =>
    setMode(window.NutrientViewer!.InteractionMode.CONTENT_EDITOR)
  const [movePopoverOpen, setMovePopoverOpen] = useState(false)
  const movePages = async (fromOneBased: number, afterOneBased: number) => {
    if (!instance) return
    const fromIndex = fromOneBased - 1
    if (fromIndex < 0 || fromIndex >= pageCount) return

    const afterIndex = afterOneBased - 1
    if (afterOneBased > pageCount || afterIndex === fromIndex) {
      setMovePopoverOpen(false)
      return
    }

    const targetIndex =
      afterOneBased <= 0
        ? 0
        : fromIndex < afterIndex
          ? afterIndex
          : afterIndex + 1

    if (targetIndex === fromIndex) {
      setMovePopoverOpen(false)
      return
    }

    const op =
      afterOneBased <= 0
        ? { type: 'movePages', pageIndexes: [fromIndex], beforePageIndex: 0 }
        : {
            type: 'movePages',
            pageIndexes: [fromIndex],
            afterPageIndex: afterIndex,
          }

    const moved = await runOperation('Move page', async (viewer) => {
      await viewer.applyOperations([op])
      viewer.setViewState((vs) => vs.set('currentPageIndex', targetIndex))
    })
    if (moved) setMovePopoverOpen(false)
  }

  const insertImage = () => {
    if (!instance) return
    const sdk = window.NutrientViewer
    const ImageAnnotation = sdk?.Annotations?.ImageAnnotation ?? sdk?.ImageAnnotation
    const Rect = sdk?.Geometry?.Rect ?? sdk?.Rect
    if (!sdk || !ImageAnnotation || !Rect || !instance.createAttachment) {
      setOperationError('Insert image unavailable')
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      void runOperation(
        'Insert image',
        async (viewer) => {
          const attachmentId = await viewer.createAttachment(file)
          const pageIndex = viewer.viewState.currentPageIndex
          const annotation = new ImageAnnotation({
            id: sdk.generateInstantId?.(),
            pageIndex,
            boundingBox: new Rect({ left: 80, top: 80, width: 180, height: 120 }),
            description: file.name || 'Inserted image',
            imageAttachmentId: attachmentId,
            contentType: file.type || 'image/png',
          })
          await viewer.create(annotation)
        },
        false,
      )
    }
    input.click()
  }

  const download = () => {
    return runOperation(
      'Download',
      async (viewer) => {
        const buffer = await viewer.exportPDF()
        const blob = new Blob([buffer], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName ?? 'document.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.setTimeout(() => URL.revokeObjectURL(url), 0)
      },
      false,
    )
  }

  const disabled = !instance

  useEffect(() => {
    if (disabled) setSignMenuOpen(false)
  }, [disabled])

  // Non-modal popover: clicks in the Web SDK iframe never bubble to `document`, so
  // React Aria cannot dismiss. Listen on the parent document and on `contentDocument`.
  useEffect(() => {
    if (!signMenuOpen) return

    const closeIfOutside = (e: Event) => {
      const t = e.target
      if (!(t instanceof Element)) return
      if (t.closest('.sign-popover-portal') || t.closest('#demo-sign-menu-trigger')) return
      setSignMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeIfOutside, true)
    const iframeDoc = instance?.contentDocument
    iframeDoc?.addEventListener('pointerdown', closeIfOutside, true)

    return () => {
      document.removeEventListener('pointerdown', closeIfOutside, true)
      iframeDoc?.removeEventListener('pointerdown', closeIfOutside, true)
    }
  }, [signMenuOpen, instance])

  return (
    <header className="toolbar" role="toolbar" aria-label="Document tools">
      <div className="toolbar__group">
        <span className="toolbar__label">Page</span>
        <input
          className="toolbar__page-input"
          value={pageInput}
          disabled={disabled}
          onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const n = parseInt(pageInput, 10)
              if (!isNaN(n)) goToPage(n)
            }
          }}
          onBlur={() => {
            const n = parseInt(pageInput, 10)
            if (!isNaN(n)) goToPage(n)
            else setPageInput(String(pageIndex + 1))
          }}
          aria-label="Current page"
        />
        <span className="toolbar__label">of {pageCount || '–'}</span>

        <Divider />

        <IconButton
          label="Rotate left"
          tooltip="Rotate page counter-clockwise"
          onClick={() => rotatePages(-90)}
          disabled={disabled}
        >
          <Icon path="M7 4a6 6 0 1 0 6 6M7 4V2M7 4l3 1" />
        </IconButton>
        <IconButton
          label="Rotate right"
          tooltip="Rotate page clockwise"
          onClick={() => rotatePages(90)}
          disabled={disabled}
        >
          <Icon path="M13 4a6 6 0 1 1-6 6M13 4V2M13 4l-3 1" />
        </IconButton>
        <IconButton
          label="Delete page"
          tooltip="Delete current page"
          onClick={deletePage}
          disabled={disabled || pageCount <= 1}
        >
          <Icon path="M4 6h12M7 6V4h6v2M6 6l1 11h6l1-11M9 9v6M11 9v6" />
        </IconButton>
        {/* Same trigger pattern as the Sign popover above: a Baseline UI
            ActionButton is required for React Aria's press detection. */}
        <Popover
          type="dialog"
          isOpen={movePopoverOpen}
          onOpenChange={setMovePopoverOpen}
        >
          <PopoverTrigger>
            <ActionButton
              id="demo-move-menu-trigger"
              variant="toolbar"
              size="sm"
              label=""
              iconStart={MoveStrokeIcon}
              iconEnd={SignMenuCaretIcon}
              isDisabled={disabled}
              aria-label="Move page"
              className="icon-btn icon-btn--split move-menu-trigger"
            />
          </PopoverTrigger>
          <PopoverContent
            placement="bottom start"
            portalClassName="sign-popover-portal"
            isNonModal
            className="sign-popover-chrome"
            contentContainerClassName="sign-popover__body"
          >
            <MovePageForm
              currentPage={pageIndex + 1}
              pageCount={pageCount}
              onMove={movePages}
              onCancel={() => setMovePopoverOpen(false)}
            />
          </PopoverContent>
        </Popover>
        <IconButton
          label="Add page"
          tooltip="Add a blank page"
          onClick={addPage}
          disabled={disabled}
        >
          <Icon path="M5 3h7l3 3v11H5zM10 9v6M7 12h6" />
        </IconButton>
      </div>

      <Divider />

      <div className="toolbar__group toolbar__group--grow">
        <LabelButton
          label="Insert image"
          tooltip="Insert image into the PDF"
          onClick={insertImage}
          disabled={disabled}
        >
          <Icon path="M3 4h14v12H3zM7 9.5l2 2 3-3 4 4M7 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        </LabelButton>
        <LabelButton
          label="Draw"
          tooltip="Add freehand drawing"
          onClick={draw}
          disabled={disabled}
        >
          <Icon path="M3 14c2-1 3-4 5-4s3 4 5 4 4-3 4-3" />
        </LabelButton>
        <LabelButton
          label="Highlight"
          tooltip="Highlight selected text"
          onClick={highlight}
          disabled={disabled}
        >
          <Icon path="M5 13l8-8 3 3-8 8H5zM4 17h6" />
        </LabelButton>
        <LabelButton
          label="Add text"
          tooltip="Add a text annotation"
          onClick={addText}
          disabled={disabled}
        >
          <Icon path="M4 5h8M8 5v10M14 11v6M11 14h6" />
        </LabelButton>
        <LabelButton
          label="Edit text"
          tooltip="Edit document text"
          onClick={editText}
          disabled={disabled}
        >
          <Icon path="M3 5h7M6 5v10M11 14l5-5 2 2-5 5h-2v-2z" />
        </LabelButton>
        {/* Popover trigger must be Baseline `ActionButton` (or similar) so React Aria press + overlay wiring runs; a raw `<button>` ignores overlay `onPress`. */}
        <Popover type="dialog" isOpen={signMenuOpen} onOpenChange={setSignMenuOpen}>
          <PopoverTrigger>
            <ActionButton
              id="demo-sign-menu-trigger"
              variant="toolbar"
              size="sm"
              label="Sign"
              iconStart={SignStrokeIcon}
              iconEnd={SignMenuCaretIcon}
              isDisabled={disabled}
              aria-label="Sign"
              className="label-btn sign-menu-trigger"
            />
          </PopoverTrigger>
          <PopoverContent
            placement="bottom start"
            portalClassName="sign-popover-portal"
            isNonModal
            className="sign-popover-chrome"
            contentContainerClassName="sign-popover__body"
          >
            <div className="sign-popover" role="menu">
              <button
                type="button"
                className="sign-popover__item"
                onClick={() => {
                  setSignMenuOpen(false)
                  onGetSignatures()
                }}
              >
                <Icon path="M5 2h7l3 3v13H5zM12 2v3h3M9 11l-2 2 1 1M9 13h2" />
                <span>Get signatures</span>
              </button>
              {savedSignatures[0] && (
                <>
                  <div className="sign-popover__divider" />
                  <button
                    type="button"
                    className="sign-popover__preview"
                    onClick={() => {
                      setSignMenuOpen(false)
                      onPickSignature(savedSignatures[0])
                    }}
                    aria-label="Use latest signature"
                  >
                    <img src={savedSignatures[0].dataUrl} alt="Saved signature" />
                  </button>
                </>
              )}
              <div className="sign-popover__divider" />
              <button
                type="button"
                className="sign-popover__item"
                onClick={() => {
                  setSignMenuOpen(false)
                  onEditSignatures()
                }}
              >
                <Icon path="M3 17l4-1 9-9-3-3-9 9zM12 4l3 3" />
                <span>Edit your signatures</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {operationError && (
        <span className="toolbar__status" role="status">
          {operationError}
        </span>
      )}

      <div className="toolbar__group toolbar__group--right">
        <IconButton
          label="Search"
          tooltip="Search the document"
          onClick={search}
          disabled={disabled}
        >
          <Icon path="M9 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM13 13l4 4" />
        </IconButton>
        <Divider />
        <IconButton
          label="Zoom out"
          tooltip="Zoom out"
          onClick={zoomOut}
          disabled={disabled}
        >
          <Icon path="M4 10h12" />
        </IconButton>
        <IconButton
          label="Zoom in"
          tooltip="Zoom in"
          onClick={zoomIn}
          disabled={disabled}
        >
          <Icon path="M10 4v12M4 10h12" />
        </IconButton>
        <Tooltip
          text="Fit page to width"
          delay={TOOLTIP_DELAY}
          closeDelay={TOOLTIP_CLOSE_DELAY}
          {...TOOLBAR_TOOLTIP_PROPS}
        >
          {({ triggerProps, triggerRef }) => (
            <button
              {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
              ref={triggerRef as React.RefObject<HTMLButtonElement>}
              className="toolbar__zoom"
              onClick={fitWidth}
              disabled={disabled}
            >
              {Math.round(zoom * 100)}%
              <Caret />
            </button>
          )}
        </Tooltip>
        <IconButton
          label="Download"
          tooltip="Download document"
          onClick={download}
          disabled={disabled}
        >
          <Icon path="M10 3v10M5 9l5 5 5-5M3 17h14" />
        </IconButton>
      </div>
    </header>
  )
}

// Tooltip delays — short enough to feel responsive on a toolbar.
const TOOLTIP_DELAY = 300
const TOOLTIP_CLOSE_DELAY = 100

/** White tooltip + arrow on the dark toolbar (Baseline `inverse` on a dark theme). */
const TOOLBAR_TOOLTIP_PROPS = {
  variant: 'inverse' as const,
  size: 'sm' as const,
  offset: 8,
  placement: 'bottom' as const,
}

/*
 * Baseline UI's <Tooltip> accepts a render-prop child that receives
 * `triggerProps` + `triggerRef`. Spreading those onto a native <button>
 * wires the tooltip up while leaving the native :hover / :focus states
 * intact. The same applies to <PopoverTrigger>: use the render-prop pattern
 * here rather than <Focusable>, which does not receive Baseline's overlay
 * trigger context and would prevent the popover from opening.
 */

function IconButton({
  label,
  tooltip,
  onClick,
  disabled,
  children,
}: {
  label: string
  tooltip?: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <Tooltip
      text={tooltip ?? label}
      delay={TOOLTIP_DELAY}
      closeDelay={TOOLTIP_CLOSE_DELAY}
      {...TOOLBAR_TOOLTIP_PROPS}
    >
      {({ triggerProps, triggerRef }) => (
        <button
          {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          ref={triggerRef as React.RefObject<HTMLButtonElement>}
          type="button"
          className="icon-btn"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          {children}
        </button>
      )}
    </Tooltip>
  )
}

function LabelButton({
  label,
  tooltip,
  onClick,
  disabled,
  hasMenu,
  children,
}: {
  label: string
  tooltip?: string
  onClick: () => void
  disabled?: boolean
  hasMenu?: boolean
  children: ReactNode
}) {
  return (
    <Tooltip
      text={tooltip ?? label}
      delay={TOOLTIP_DELAY}
      closeDelay={TOOLTIP_CLOSE_DELAY}
      {...TOOLBAR_TOOLTIP_PROPS}
    >
      {({ triggerProps, triggerRef }) => (
        <button
          {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          ref={triggerRef as React.RefObject<HTMLButtonElement>}
          type="button"
          className="label-btn"
          onClick={onClick}
          disabled={disabled}
        >
          {children}
          <span>{label}</span>
          {hasMenu && <Caret />}
        </button>
      )}
    </Tooltip>
  )
}

/** Icons for `ActionButton` (expects SVG components, not raw DOM `<button>` + overlay props). */
function MoveStrokeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M10 3v14M3 10h14M7 6l-4 4 4 4M13 6l4 4-4 4M6 7l4-4 4 4M6 13l4 4 4-4" />
    </svg>
  )
}

function SignStrokeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M3 14c1-1 2-3 4-6s3-4 4-3-1 5 0 7 3 1 6-1" />
    </svg>
  )
}

function SignMenuCaretIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={10}
      height={10}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M5 8l5 5 5-5" />
    </svg>
  )
}

function Divider() {
  return <span className="toolbar__divider" aria-hidden />
}

function Icon({ path }: { path: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={path} />
    </svg>
  )
}

const Caret = CaretIcon

function MovePageForm({
  currentPage,
  pageCount,
  onMove,
  onCancel,
}: {
  currentPage: number
  pageCount: number
  onMove: (from: number, after: number) => void
  onCancel: () => void
}) {
  const [from, setFrom] = useState(String(currentPage))
  const [after, setAfter] = useState('')

  const fromNum = parseInt(from, 10)
  const afterNum = parseInt(after, 10)
  const fromValid = Number.isInteger(fromNum) && fromNum >= 1 && fromNum <= pageCount
  const afterValid =
    Number.isInteger(afterNum) && afterNum >= 0 && afterNum <= pageCount && afterNum !== fromNum
  const canMove = fromValid && afterValid

  const submit = () => {
    if (!canMove) return
    onMove(fromNum, afterNum)
  }

  return (
    <form
      className="move-popover"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <label className="move-popover__label" htmlFor="move-from">
        Move page:
      </label>
      <input
        id="move-from"
        className="move-popover__input"
        inputMode="numeric"
        autoFocus
        value={from}
        onChange={(e) => setFrom(e.target.value.replace(/\D/g, ''))}
      />

      <label className="move-popover__label" htmlFor="move-after">
        After page:
      </label>
      <input
        id="move-after"
        className="move-popover__input"
        inputMode="numeric"
        placeholder="Enter a page number"
        value={after}
        onChange={(e) => setAfter(e.target.value.replace(/\D/g, ''))}
      />

      <div className="move-popover__actions">
        <button
          type="button"
          className="move-popover__btn move-popover__btn--secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="move-popover__btn"
          disabled={!canMove}
        >
          Move
        </button>
      </div>
    </form>
  )
}
