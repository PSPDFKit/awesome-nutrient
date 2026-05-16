import { useState, type DragEvent } from 'react'
import { CloseIcon } from '../lib/icons'
import type { Signer } from './storage'

export type FieldType =
  | 'signature'
  | 'initials'
  | 'date-signed'
  | 'full-name'
  | 'email'
  | 'title'
  | 'company'
  | 'textbox'
  | 'checkbox'

type FieldDef = { id: FieldType; label: string; icon: string }

const SIGNATURE_FIELDS: FieldDef[] = [
  { id: 'signature', label: 'Signature', icon: 'M3 14c1-1 2-3 4-6s3-4 4-3-1 5 0 7 3 1 6-1' },
  { id: 'initials', label: 'Initials', icon: 'M4 6h4M6 6v8M4 14h4M11 14V8h2a2 2 0 1 1 0 4h-2M16 14V8h2' },
]

const AUTO_FILL_FIELDS: FieldDef[] = [
  { id: 'date-signed', label: 'Date signed', icon: 'M3 5h14v12H3zM3 9h14M7 3v4M13 3v4' },
  { id: 'full-name', label: 'Full name', icon: 'M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 17c.5-2.5 3-4 7-4s6.5 1.5 7 4' },
  { id: 'email', label: 'Email address', icon: 'M3 5h14v10H3zM3 5l7 6 7-6' },
  { id: 'title', label: 'Title', icon: 'M3 6h14v10H3zM7 6V4h6v2M3 10h14' },
  { id: 'company', label: 'Company', icon: 'M3 6h7v11H3zM10 6h7v11h-7zM5 9h2M5 12h2M12 9h2M12 12h2' },
]

const STANDARD_FIELDS: FieldDef[] = [
  { id: 'textbox', label: 'Textbox', icon: 'M3 6h14v10H3zM7 9h6M7 12h4' },
  { id: 'checkbox', label: 'Checkbox', icon: 'M4 4h12v12H4zM7 10l2 2 4-4' },
]

type Props = {
  open: boolean
  onClose: () => void
  signers: Signer[]
  activeSignerId: string
  onSelectSigner: (id: string) => void
  onOpenSignersModal: () => void
  onPlaceField: (type: FieldType) => void
}

export function SignersPanel({
  open,
  onClose,
  signers,
  activeSignerId,
  onSelectSigner,
  onOpenSignersModal,
  onPlaceField,
}: Props) {
  const [signersDropdownOpen, setSignersDropdownOpen] = useState(false)

  if (!open) return null

  const activeSigner = signers.find((s) => s.id === activeSignerId) ?? signers[0]

  const handleDragStart = (type: FieldType) => (e: DragEvent<HTMLButtonElement>) => {
    e.dataTransfer.setData('application/x-nutrient-field', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <aside className="signers-panel">
      <div className="signers-panel__header">
        <DocumentIcon />
        <h2>Signers and fields</h2>
        <button
          className="signers-panel__close"
          aria-label="Close panel"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="signers-panel__section">
        <span className="signers-panel__label">Signer</span>
        <div className={`signers-panel__signer${signersDropdownOpen ? ' signers-panel__signer--open' : ''}`}>
          <button
            type="button"
            className="signers-panel__signer-trigger"
            onClick={() => setSignersDropdownOpen((v) => !v)}
          >
            <SignerIcon />
            <span>{activeSigner?.name ?? 'Me (now)'}</span>
            <ChevronIcon />
          </button>
          {signersDropdownOpen && (
            <ul className="signers-panel__signer-menu" role="listbox">
              {signers.map((s) => (
                <li
                  key={s.id}
                  className={`signers-panel__signer-option${activeSignerId === s.id ? ' signers-panel__signer-option--active' : ''}`}
                  onClick={() => {
                    onSelectSigner(s.id)
                    setSignersDropdownOpen(false)
                  }}
                  role="option"
                  aria-selected={activeSignerId === s.id}
                >
                  <span>{s.name || 'Untitled signer'}</span>
                  {s.email && <small>{s.email}</small>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          className="signers-panel__add-signers"
          onClick={() => {
            setSignersDropdownOpen(false)
            onOpenSignersModal()
          }}
        >
          <PersonIcon /> Add/edit signers
        </button>
      </div>

      <FieldGroup
        heading="Signature fields"
        fields={SIGNATURE_FIELDS}
        onDragStart={handleDragStart}
        onClick={onPlaceField}
      />
      <FieldGroup
        heading="Auto-fill fields"
        fields={AUTO_FILL_FIELDS}
        onDragStart={handleDragStart}
        onClick={onPlaceField}
      />
      <FieldGroup
        heading="Standard fields"
        fields={STANDARD_FIELDS}
        onDragStart={handleDragStart}
        onClick={onPlaceField}
      />
    </aside>
  )
}

function FieldGroup({
  heading,
  fields,
  onDragStart,
  onClick,
}: {
  heading: string
  fields: FieldDef[]
  onDragStart: (type: FieldType) => (e: DragEvent<HTMLButtonElement>) => void
  onClick: (type: FieldType) => void
}) {
  return (
    <div className="signers-panel__section">
      <span className="signers-panel__label">{heading}</span>
      <ul className="field-list">
        {fields.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              className="field-pill"
              draggable
              onDragStart={onDragStart(f.id)}
              onClick={() => onClick(f.id)}
              title={`Drag onto the document or click to place a ${f.label.toLowerCase()} field`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={f.icon} />
              </svg>
              <span>{f.label}</span>
              <span className="field-pill__handle" aria-hidden>⋮⋮</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────

function DocumentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 2h7l3 3v13H5zM12 2v3h3M8 11l2 2 4-4" />
    </svg>
  )
}
function SignerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 6h6M4 10h8M4 14h6M14 7v8M11 11h6" />
    </svg>
  )
}
function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 8l5 5 5-5" />
    </svg>
  )
}
function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c.5-2.5 3-4 6-4s5.5 1.5 6 4" />
    </svg>
  )
}
