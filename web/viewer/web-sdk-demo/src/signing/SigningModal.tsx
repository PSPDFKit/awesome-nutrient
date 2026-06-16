import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  deleteSignature,
  getSavedSignatures,
  saveSignature,
  type SavedSignature,
} from './storage'
import { CloseIcon, TrashIcon } from '../lib/icons'

type SignatureKind = 'signature' | 'initials'

type Props = {
  kind: SignatureKind
  onClose: () => void
  onInsert: (dataUrl: string) => void
}

type Tab = 'draw' | 'type' | 'upload' | 'saved'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'draw', label: 'Draw', icon: 'M3 14c2-1 3-4 5-4s3 4 5 4 4-3 4-3' },
  { id: 'type', label: 'Type', icon: 'M3 6h14v8H3zM3 10h14M6 9v2M14 9v2' },
  { id: 'upload', label: 'Upload', icon: 'M4 13v3h12v-3M10 3v9M6 7l4-4 4 4' },
  { id: 'saved', label: 'Saved', icon: 'M5 6a3 3 0 1 1 6 0 3 3 0 1 1 4 4M5 12a4 4 0 1 0 8 0H5z' },
]

export function SigningModal({ kind, onClose, onInsert }: Props) {
  const [tab, setTab] = useState<Tab>('draw')
  const [drawDataUrl, setDrawDataUrl] = useState<string | null>(null)
  const [typedText, setTypedText] = useState('')
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null)
  const [savedList, setSavedList] = useState<SavedSignature[]>(() => getSavedSignatures(kind))
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null)

  const title = kind === 'initials' ? 'Add your initials' : 'Add your signature'

  // The data URL that "Insert" will commit, derived from the active tab.
  const stagedDataUrl = useMemo(() => {
    switch (tab) {
      case 'draw':
        return drawDataUrl
      case 'type':
        return typedText.trim() ? renderTypedToDataUrl(typedText.trim()) : null
      case 'upload':
        return uploadDataUrl
      case 'saved':
        return savedList.find((s) => s.id === selectedSavedId)?.dataUrl ?? null
    }
  }, [tab, drawDataUrl, typedText, uploadDataUrl, savedList, selectedSavedId])

  const refresh = useCallback(() => setSavedList(getSavedSignatures(kind)), [kind])

  const handleInsert = () => {
    if (!stagedDataUrl) return
    // Persist new (draw / type / upload), but skip re-saving an already-saved pick.
    if (tab !== 'saved') saveSignature({ kind, dataUrl: stagedDataUrl })
    onInsert(stagedDataUrl)
  }

  return (
    <div className="signing-modal__backdrop" onClick={onClose}>
      <div
        className="signing-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <button
          className="signing-modal__close"
          aria-label="Close"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <h2 className="signing-modal__title">{title}</h2>

        <div className="signing-modal__tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`signing-tab${tab === t.id ? ' signing-tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={t.icon} />
              </svg>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="signing-modal__body">
          {tab === 'draw' && (
            <DrawPad onChange={setDrawDataUrl} dataUrl={drawDataUrl} />
          )}
          {tab === 'type' && (
            <TypePad value={typedText} onChange={setTypedText} />
          )}
          {tab === 'upload' && (
            <UploadPad dataUrl={uploadDataUrl} onChange={setUploadDataUrl} />
          )}
          {tab === 'saved' && (
            <SavedPad
              items={savedList}
              selectedId={selectedSavedId}
              onSelect={setSelectedSavedId}
              onDelete={(id) => {
                deleteSignature(id)
                if (selectedSavedId === id) setSelectedSavedId(null)
                refresh()
              }}
            />
          )}
        </div>

        <div className="signing-modal__footer">
          <p className="signing-modal__disclaimer">
            By selecting "Insert," I agree to be legally bound by this document and that the
            signature above is a legal representation of my signature.
          </p>
          <button
            type="button"
            className="signing-modal__insert"
            disabled={!stagedDataUrl}
            onClick={handleInsert}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Draw tab — minimal canvas pad, no external lib. ───────────────────

function DrawPad({
  dataUrl,
  onChange,
}: {
  dataUrl: string | null
  onChange: (url: string | null) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  // Init canvas + restore any prior dataUrl when the tab is re-entered.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Hi-DPI sizing.
    const ratio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#111'
    if (dataUrl) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height)
      img.src = dataUrl
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    drawingRef.current = true
    const point = relativePoint(e)
    lastPointRef.current = point
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  const move = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const point = relativePoint(e)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    lastPointRef.current = point
  }

  const end = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    const url = canvasRef.current?.toDataURL('image/png') ?? null
    onChange(url)
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      onChange(null)
    }
  }

  return (
    <div className="signing-pad">
      <div className="signing-pad__canvas">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        <span className="signing-pad__guide">×</span>
      </div>
      <button type="button" className="signing-pad__clear" onClick={clear}>
        <TrashIcon size={14} /> Clear
      </button>
    </div>
  )
}

function relativePoint(e: ReactPointerEvent<HTMLCanvasElement>) {
  const rect = e.currentTarget.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

// ── Type tab — typed text rendered to SVG/canvas. ─────────────────────

function TypePad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="signing-pad signing-pad--type">
      <button
        type="button"
        className="signing-pad__type-preview"
        onClick={() => inputRef.current?.focus()}
      >
        {value.trim() ? (
          <span className="signing-pad__type-text">{value}</span>
        ) : (
          <span className="signing-pad__type-placeholder">Type your name</span>
        )}
      </button>
      <input
        ref={inputRef}
        className="signing-pad__type-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your name"
        maxLength={64}
      />
    </div>
  )
}

function renderTypedToDataUrl(text: string): string {
  // Render the typed text to an offscreen canvas using a script-style font.
  const canvas = document.createElement('canvas')
  const ratio = window.devicePixelRatio || 1
  const width = 800
  const height = 200
  canvas.width = width * ratio
  canvas.height = height * ratio
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.scale(ratio, ratio)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#111'
  ctx.font = `64px "Segoe Script", "Brush Script MT", cursive`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(text, width / 2, height / 2)
  return canvas.toDataURL('image/png')
}

// ── Upload tab. ───────────────────────────────────────────────────────

function UploadPad({
  dataUrl,
  onChange,
}: {
  dataUrl: string | null
  onChange: (url: string | null) => void
}) {
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 1024 * 1024) {
      alert('File must be smaller than 1MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  return (
    <div className="signing-pad signing-pad--upload">
      {dataUrl ? (
        <img className="signing-pad__upload-preview" src={dataUrl} alt="Uploaded signature" />
      ) : (
        <>
          <p className="signing-pad__upload-info">Upload a photo of your signature.</p>
          <p className="signing-pad__upload-info signing-pad__upload-info--muted">
            Max file size: 1MB
            <br />
            png, jpg, jpeg, bmp, gif
          </p>
        </>
      )}
      <label className="signing-pad__upload-btn">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/bmp,image/gif"
          onChange={handleFile}
        />
        <UploadIcon /> Upload Photo
      </label>
    </div>
  )
}

// ── Saved tab. ────────────────────────────────────────────────────────

function SavedPad({
  items,
  selectedId,
  onSelect,
  onDelete,
}: {
  items: SavedSignature[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}) {
  if (items.length === 0) {
    return (
      <div className="signing-pad signing-pad--empty">
        <p>No saved signatures yet. Draw, type, or upload one to save it here.</p>
      </div>
    )
  }
  return (
    <div className="signing-pad signing-pad--saved">
      {items.map((s) => (
        <div
          key={s.id}
          className={`saved-tile${selectedId === s.id ? ' saved-tile--active' : ''}`}
          onClick={() => onSelect(s.id)}
        >
          <img src={s.dataUrl} alt="Saved signature" />
          <button
            type="button"
            className="saved-tile__delete"
            aria-label="Delete signature"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(s.id)
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Icons. ────────────────────────────────────────────────────────────

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 4h14v12H3zM7 9.5l2 2 3-3 4 4M7 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    </svg>
  )
}
