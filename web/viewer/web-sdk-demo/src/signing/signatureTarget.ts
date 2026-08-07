/**
 * Helpers for placing a signature image onto the page.
 *
 * The "where to drop the signature" question is answered by, in order of
 * preference:
 *   1. The signature widget the user clicked (we look it up by id), or
 *   2. The widget that's currently selected, or
 *   3. The bounding box the caller staged in the SigningModal, or
 *   4. A small fallback box near the top of the current page.
 */

import { getFirstSelectedAnnotation } from '../lib/selection'
import type { SDKInstance } from '../types/global'

export type SignatureKind = 'signature' | 'initials'

type KindTaggedAnnotation = {
  customData?: {
    nutrientDemo?: {
      kind?: unknown
    }
  }
}

export type Rect = { left: number; top: number; width: number; height: number }

export type SignatureTarget = {
  kind: SignatureKind
  pageIndex: number
  boundingBox: Rect
  widgetId?: string
}

export type SignatureWidgetAnnotation = {
  id?: string
  formFieldName?: string
  pageIndex?: number
  boundingBox?: unknown
  customData?: KindTaggedAnnotation['customData']
}

export function createKindCustomData(kind: SignatureKind) {
  return { nutrientDemo: { kind } }
}

export function getMarkKind(annotation: unknown): SignatureKind {
  return getTaggedKind(annotation) ?? 'signature'
}

export function isSignatureWidgetAnnotation(annotation: SignatureWidgetAnnotation | null) {
  if (getTaggedKind(annotation)) return true
  const name = annotation?.formFieldName ?? ''
  return name.startsWith('signature-') || name.startsWith('initials-')
}

export function getSignatureTargetForAnnotation(
  annotation: SignatureWidgetAnnotation | null,
  viewerInstance: SDKInstance,
): SignatureTarget {
  const kind = getWidgetKind(annotation)

  return {
    kind,
    pageIndex: annotation?.pageIndex ?? viewerInstance.viewState.currentPageIndex,
    boundingBox: toPlainRect(annotation?.boundingBox, defaultBox(kind)),
    widgetId: annotation?.id,
  }
}

export async function resolveSignatureInsertionTarget(
  instance: SDKInstance,
  target: SignatureTarget | null,
) {
  const fallbackBox = target?.boundingBox ?? defaultBox(target?.kind ?? 'signature')

  const selectedAnnotation =
    getFirstSelectedAnnotation<SignatureWidgetAnnotation>(instance.getSelectedAnnotations?.())
  const selectedWidget = isSignatureWidgetAnnotation(selectedAnnotation) ? selectedAnnotation : null

  const targetWidget = target?.widgetId
    ? await getAnnotationById(instance, target.pageIndex, target.widgetId)
    : null

  const widget = targetWidget ?? selectedWidget
  const kind = widget ? getWidgetKind(widget) : (target?.kind ?? 'signature')

  return {
    kind,
    pageIndex: widget?.pageIndex ?? target?.pageIndex ?? instance.viewState.currentPageIndex,
    boundingBox: toPlainRect(widget?.boundingBox, fallbackBox),
  }
}

export function getDataUrlContentType(dataUrl: string) {
  return /^data:([^;,]+)/.exec(dataUrl)?.[1] ?? null
}

function defaultBox(kind: SignatureKind): Rect {
  return { left: 80, top: 80, width: kind === 'initials' ? 100 : 200, height: 40 }
}

function getWidgetKind(annotation: SignatureWidgetAnnotation | null): SignatureKind {
  const taggedKind = getTaggedKind(annotation)
  if (taggedKind) return taggedKind
  return annotation?.formFieldName?.startsWith('initials-') ? 'initials' : 'signature'
}

function getTaggedKind(annotation: unknown): SignatureKind | null {
  const kind = (annotation as KindTaggedAnnotation | null)?.customData?.nutrientDemo?.kind
  return kind === 'signature' || kind === 'initials' ? kind : null
}

async function getAnnotationById(
  instance: SDKInstance,
  pageIndex: number,
  annotationId: string,
) {
  try {
    const annotations = await instance.getAnnotations(pageIndex)
    return (
      annotations
        .toArray()
        .find((annotation) => annotation.id === annotationId) ?? null
    ) as SignatureWidgetAnnotation | null
  } catch (error) {
    console.error('Failed to resolve signature widget', error)
    return null
  }
}

function toPlainRect(rect: unknown, fallback: Rect): Rect {
  const candidate = rect as Partial<Rect> | null

  return {
    left: typeof candidate?.left === 'number' ? candidate.left : fallback.left,
    top: typeof candidate?.top === 'number' ? candidate.top : fallback.top,
    width: typeof candidate?.width === 'number' ? candidate.width : fallback.width,
    height: typeof candidate?.height === 'number' ? candidate.height : fallback.height,
  }
}
