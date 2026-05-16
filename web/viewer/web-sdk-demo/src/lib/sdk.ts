import type { SDKInstance } from '../types/global'

export function isFormCreatorMode(instance: SDKInstance): boolean {
  const formCreator = window.NutrientViewer?.InteractionMode?.FORM_CREATOR
  return Boolean(formCreator && instance.viewState.interactionMode === formCreator)
}

/**
 * `instance.setSelectedAnnotations` expects either an Immutable.List of ids or
 * a plain array, depending on SDK build. This builds the right shape.
 */
export function annotationIdList(ids: string[]): unknown {
  const ImmutableList = window.NutrientViewer?.Immutable?.List
  return ImmutableList ? ImmutableList(ids) : ids
}
