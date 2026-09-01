import { useState } from 'react'
import { setSigners as persistSigners, type Signer } from './storage'
import { TrashIcon } from '../lib/icons'

type Props = {
  initialSigners: Signer[]
  onClose: () => void
  onSave: (signers: Signer[]) => void
}

type Draft = { id: string; name: string; email: string }

export function SignersModal({ initialSigners, onClose, onSave }: Props) {
  // Editable rows are user-defined signers only — "Me (now)" is always implicit.
  const [drafts, setDrafts] = useState<Draft[]>(() => {
    const editable = initialSigners.filter((s) => !s.builtin)
    if (editable.length === 0) return [{ id: newId(), name: '', email: '' }]
    return editable.map((s) => ({ id: s.id, name: s.name, email: s.email }))
  })

  const update = (id: string, patch: Partial<Draft>) =>
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))

  const remove = (id: string) =>
    setDrafts((prev) => (prev.length === 1 ? prev : prev.filter((d) => d.id !== id)))

  const add = () => setDrafts((prev) => [...prev, { id: newId(), name: '', email: '' }])

  const canSave = drafts.some((d) => d.name.trim() || d.email.trim())

  const handleSave = () => {
    if (!canSave) return
    const cleaned = drafts
      .map((d) => ({ id: d.id, name: d.name.trim(), email: d.email.trim() }))
      .filter((d) => d.name || d.email)
    persistSigners(cleaned)
    // The full list returned upstream includes the implicit "Me (now)" entry first.
    onSave([
      { id: 'me', name: 'Me (now)', email: '', builtin: true },
      ...cleaned.map((d) => ({ ...d })),
    ])
  }

  return (
    <div className="signing-modal__backdrop" onClick={onClose}>
      <div
        className="signers-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Signers"
      >
        <button className="signing-modal__close" aria-label="Close" onClick={onClose}>
          <span aria-hidden>×</span>
        </button>

        <h2 className="signing-modal__title">Signers</h2>
        <p className="signers-modal__lede">Add the people who need to sign this document.</p>

        <div className="signers-modal__rows">
          <div className="signers-modal__row signers-modal__row--header">
            <span>Name</span>
            <span>Email address</span>
            <span />
          </div>
          {drafts.map((d) => (
            <div className="signers-modal__row" key={d.id}>
              <input
                className="signers-modal__input"
                placeholder="Full name"
                value={d.name}
                onChange={(e) => update(d.id, { name: e.target.value })}
              />
              <input
                className="signers-modal__input"
                placeholder="email@example.com"
                value={d.email}
                onChange={(e) => update(d.id, { email: e.target.value })}
              />
              <button
                type="button"
                className="signers-modal__remove"
                aria-label="Remove signer"
                onClick={() => remove(d.id)}
                disabled={drafts.length === 1}
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="signers-modal__add" onClick={add}>
          <PersonAddIcon /> Add another signer
        </button>

        <div className="signers-modal__footer">
          <button className="signing-modal__btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="signing-modal__insert" onClick={handleSave} disabled={!canSave}>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

function newId() {
  return `signer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function PersonAddIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 17c.5-2.5 2.5-4 5-4s4.5 1.5 5 4M15 6v6M12 9h6" />
    </svg>
  )
}
