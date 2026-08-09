import type { SDKInstance } from '../types/global'

export function isFormCreatorMode(instance: SDKInstance): boolean {
  const formCreator = window.NutrientViewer?.InteractionMode?.FORM_CREATOR
  return Boolean(formCreator && instance.viewState.interactionMode === formCreator)
}

/** Builds the Immutable.List required by `instance.setSelectedAnnotations`. */
export function annotationIdList(ids: string[]): unknown {
  const ImmutableList = window.NutrientViewer?.Immutable?.List
  // The array fallback keeps this demo from crashing if the CDN global is
  // incomplete; it is not part of the documented SDK contract.
  return ImmutableList ? ImmutableList(ids) : ids
}

export function isAnnotationOfType(value: unknown, annotationName: string): boolean {
  if (!value || typeof value !== 'object') return false

  const AnnotationCtor = (
    window.NutrientViewer?.Annotations as Record<string, unknown> | undefined
  )?.[annotationName]

  if (typeof AnnotationCtor === 'function' && value instanceof AnnotationCtor) {
    return true
  }

  return (value as { constructor?: { name?: string } }).constructor?.name === annotationName
}
