/**
 * `instance.getSelectedAnnotations()` doesn't have a single shape across SDK
 * versions and events:
 *
 *   - `viewState.change` payloads come through as `{ annotation }` objects.
 *   - Newer builds return an Immutable.List exposing `.first()` / `.get()`.
 *   - Some code paths return a plain JS array.
 *
 * These helpers normalize all three so callers can ask "what's selected?"
 * without re-implementing the shape-juggling.
 */

type ListLike = {
  first?: () => unknown
  get?: (index: number) => unknown
  size?: number
}

type DirectSelection = { annotation?: unknown }

export function getFirstSelectedAnnotation<T = unknown>(selection: unknown): T | null {
  if (!selection) return null

  const direct = selection as DirectSelection
  if (direct.annotation) return direct.annotation as T

  if (Array.isArray(selection)) return (selection[0] ?? null) as T | null

  const listLike = selection as ListLike
  if (typeof listLike.first === 'function') return listLike.first() as T
  if (typeof listLike.get === 'function') return listLike.get(0) as T

  return null
}

export function getSelectionSize(selection: unknown): number {
  if (!selection) return 0
  if (Array.isArray(selection)) return selection.length
  const sized = selection as { size?: number }
  if (typeof sized.size === 'number') return sized.size
  return (selection as DirectSelection).annotation ? 1 : 0
}
