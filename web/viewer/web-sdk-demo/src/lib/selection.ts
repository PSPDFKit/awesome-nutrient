/**
 * Selection events and `getSelectedAnnotations()` use an Immutable.List.
 * These helpers also tolerate arrays and direct annotation wrappers so the
 * demo fails safely when called with defensive integration-layer inputs.
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
