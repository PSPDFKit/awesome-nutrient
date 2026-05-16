/**
 * LocalStorage layer for the demo's signing UI.
 *
 * Holds:
 * - The list of signers shown in the Signers/Fields panel and Add/edit-signers modal.
 * - Saved drawn/typed signatures + initials reused across sessions.
 *
 * Everything is namespaced under a `nutrient-demo:` prefix so it doesn't
 * collide with other localStorage entries.
 */

const NAMESPACE = 'nutrient-demo'
const SIGNERS_KEY = `${NAMESPACE}:signers`
const SIGNATURES_KEY = `${NAMESPACE}:signatures`

export type Signer = {
  id: string
  name: string
  email: string
  // The signer that represents the current user. Always present at id 'me'.
  builtin?: boolean
}

export type SavedSignature = {
  id: string
  /** Either 'signature' or 'initials' so the modal can offer the right pool. */
  kind: 'signature' | 'initials'
  /** Data URL — works for drawn, typed, and uploaded signatures. */
  dataUrl: string
  createdAt: number
}

const ME: Signer = { id: 'me', name: 'Me (now)', email: '', builtin: true }

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ── Signers ───────────────────────────────────────────────────────────

export function getSigners(): Signer[] {
  const stored = readJSON<Signer[]>(SIGNERS_KEY, [])
  // Always surface the built-in "Me (now)" entry first.
  return [ME, ...stored.filter((s) => s.id !== 'me')]
}

export function setSigners(signers: Signer[]) {
  // Persist only user-defined signers; "Me (now)" is always derived.
  writeJSON(
    SIGNERS_KEY,
    signers.filter((s) => !s.builtin),
  )
}

// ── Saved signatures ──────────────────────────────────────────────────

export function getSavedSignatures(kind?: SavedSignature['kind']): SavedSignature[] {
  const all = readJSON<SavedSignature[]>(SIGNATURES_KEY, [])
  return kind ? all.filter((s) => s.kind === kind) : all
}

export function saveSignature(entry: Omit<SavedSignature, 'id' | 'createdAt'>): SavedSignature {
  const record: SavedSignature = {
    id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    ...entry,
  }
  const all = readJSON<SavedSignature[]>(SIGNATURES_KEY, [])
  writeJSON(SIGNATURES_KEY, [record, ...all])
  return record
}

export function deleteSignature(id: string) {
  const all = readJSON<SavedSignature[]>(SIGNATURES_KEY, [])
  writeJSON(
    SIGNATURES_KEY,
    all.filter((s) => s.id !== id),
  )
}
