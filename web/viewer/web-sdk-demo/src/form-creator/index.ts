/**
 * Custom Form Creator UI extensions:
 *
 *   - `createFieldPropertyEditorSlotBridge` — replaces the SDK's built-in
 *     property editor sidebar with our own DOM rendered into the slot.
 *   - `createAnnotationTooltipItems` — adds "Delete field" / "Edit field"
 *     buttons to the contextual annotation tooltip.
 *   - `installFormCreatorModeRestore` — when the user enters Form Creator
 *     mode via "Edit field" then clears the selection, automatically pop
 *     back to whatever interactionMode they were in before.
 *
 * Lives outside `NutrientViewer.tsx` so the viewer file is just SDK wiring.
 */

import { getFirstSelectedAnnotation } from '../lib/selection'
import { annotationIdList, isFormCreatorMode } from '../lib/sdk'
import type { SDKInstance } from '../types/global'

type WidgetLikeAnnotation = {
  id?: string
  formFieldName?: string
  set?: (key: string, value: unknown) => unknown
}

const previousInteractionModes = new WeakMap<SDKInstance, unknown>()

export function createFieldPropertyEditorSlotBridge() {
  const hideSlot = () => ({ render: () => null })

  return {
    header: hideSlot,
    body: (instance: unknown) => ({
      render: () => {
        const viewerInstance = instance as SDKInstance
        const annotation = getFirstSelectedAnnotation<WidgetLikeAnnotation>(
          viewerInstance.getSelectedAnnotations?.(),
        )

        if (!annotation?.formFieldName) return null

        const panel = document.createElement('div')
        panel.className = 'demo-field-editor'
        containSlotEvents(panel)
        renderFieldEditor(panel, viewerInstance, annotation)
        return panel
      },
    }),
    footer: hideSlot,
  }
}

export function createAnnotationTooltipItems(
  instance: SDKInstance | null,
  annotation: WidgetLikeAnnotation,
) {
  if (!instance || !annotation?.formFieldName || isFormCreatorMode(instance)) return []

  return [
    {
      type: 'custom',
      id: 'demo-delete-field',
      title: 'Delete field',
      icon: getIcon('trash'),
      className: 'demo-field-tooltip-button demo-field-tooltip-button--delete',
      onPress: (event?: Event) => {
        event?.stopPropagation()
        void deleteField(instance, annotation)
      },
    },
    {
      type: 'custom',
      id: 'demo-edit-field',
      title: 'Edit field',
      icon: getIcon('edit'),
      className: 'demo-field-tooltip-button',
      onPress: (event?: Event) => {
        event?.stopPropagation()
        openFormCreatorEditor(instance, annotation)
      },
    },
  ]
}

/**
 * Track the user's last "real" interactionMode so we can restore it when they
 * enter FORM_CREATOR via "Edit field" and then click off the field.
 *
 * Returns a teardown function the caller (NutrientViewer's load effect)
 * invokes on unmount.
 */
export function installFormCreatorModeRestore(instance: SDKInstance) {
  let lastNonFormCreatorMode = instance.viewState.interactionMode

  const rememberPreviousMode = (viewState: unknown) => {
    const nextViewState = viewState as SDKInstance['viewState']

    if (isFormCreatorMode(instance)) {
      if (!previousInteractionModes.has(instance)) {
        previousInteractionModes.set(instance, lastNonFormCreatorMode)
      }
      return
    }

    previousInteractionModes.delete(instance)
    lastNonFormCreatorMode = nextViewState.interactionMode
  }

  const restoreIfSelectionCleared = (selection: unknown) => {
    if (!previousInteractionModes.has(instance)) return
    if (!isFormCreatorMode(instance)) {
      previousInteractionModes.delete(instance)
      return
    }
    if (getFirstSelectedAnnotation(selection)) return

    const previousMode = previousInteractionModes.get(instance)
    previousInteractionModes.delete(instance)
    instance.setViewState((viewState) => viewState.set('interactionMode', previousMode))
  }

  instance.addEventListener('viewState.change', rememberPreviousMode)
  instance.addEventListener('annotationSelection.change', restoreIfSelectionCleared)

  return () => {
    previousInteractionModes.delete(instance)
    instance.removeEventListener('viewState.change', rememberPreviousMode)
    instance.removeEventListener('annotationSelection.change', restoreIfSelectionCleared)
  }
}

function openFormCreatorEditor(instance: SDKInstance, annotation: WidgetLikeAnnotation) {
  const formCreatorMode = window.NutrientViewer?.InteractionMode?.FORM_CREATOR
  if (!formCreatorMode) return

  if (!previousInteractionModes.has(instance)) {
    previousInteractionModes.set(instance, instance.viewState.interactionMode)
  }

  instance.setViewState((viewState) => viewState.set('interactionMode', formCreatorMode))

  if (!annotation.id) return

  // Re-select on the next microtask: the FORM_CREATOR transition above clears
  // the active selection, so we have to put it back after the mode flip.
  queueMicrotask(() => {
    instance.setSelectedAnnotations?.(annotationIdList([annotation.id!]))
  })
}

function renderFieldEditor(
  panel: HTMLElement,
  instance: SDKInstance,
  annotation: WidgetLikeAnnotation,
) {
  const title = getFieldTitle(annotation)
  const icon = getFieldIcon(title)

  panel.innerHTML = `
    <div class="demo-field-editor__header">
      <div class="demo-field-editor__title">
        ${icon}
        <span>${escapeHTML(title)}</span>
      </div>
      <button class="demo-field-editor__delete" type="button" aria-label="Delete field">
        ${getIcon('trash')}
      </button>
    </div>
    <label class="demo-field-editor__label">
      <span>Assigned to</span>
      <select class="demo-field-editor__select" aria-label="Assigned to">
        <option>Me (now)</option>
      </select>
    </label>
    <label class="demo-field-editor__label">
      <span>Field name</span>
      <input class="demo-field-editor__input" value="${escapeHTML(annotation.formFieldName ?? '')}" />
    </label>
  `

  const input = panel.querySelector<HTMLInputElement>('.demo-field-editor__input')
  const deleteButton = panel.querySelector<HTMLButtonElement>('.demo-field-editor__delete')

  deleteButton?.addEventListener('click', () => {
    void deleteField(instance, annotation)
  })

  const commitName = () => {
    const nextName = input?.value.trim()
    if (!nextName || nextName === annotation.formFieldName) return
    void renameField(instance, annotation, nextName)
  }

  input?.addEventListener('blur', commitName)
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitName()
      input.blur()
    }
  })
}

/**
 * Slot DOM lives inside the SDK iframe. Without this, any click inside our
 * editor bubbles up to the SDK and clears the selection — which then unmounts
 * the editor mid-interaction.
 */
function containSlotEvents(element: HTMLElement) {
  const stop = (event: Event) => event.stopPropagation()
  const events = [
    'pointerdown',
    'pointerup',
    'mousedown',
    'mouseup',
    'click',
    'dblclick',
    'touchstart',
    'touchend',
    'keydown',
  ]
  events.forEach((name) => element.addEventListener(name, stop))
}

async function getFormFieldForAnnotation(
  instance: SDKInstance,
  annotation: WidgetLikeAnnotation,
) {
  const fields = await instance.getFormFields?.()
  const allFields = fields?.toArray?.() ?? []
  return allFields.find((field) => field.name === annotation.formFieldName) ?? null
}

async function deleteField(instance: SDKInstance, annotation: WidgetLikeAnnotation) {
  try {
    const formField = await getFormFieldForAnnotation(instance, annotation)
    const target = formField?.id ?? formField ?? annotation.id
    if (!target) return
    await instance.delete(target)
  } catch (error) {
    console.error('Failed to delete field', error)
  }
}

async function renameField(
  instance: SDKInstance,
  annotation: WidgetLikeAnnotation,
  nextName: string,
) {
  try {
    const updates: unknown[] = []
    const formField = await getFormFieldForAnnotation(instance, annotation)

    if (formField?.set) updates.push(formField.set('name', nextName))
    if (annotation.set) updates.push(annotation.set('formFieldName', nextName))

    if (updates.length > 0) await instance.update(updates)
  } catch (error) {
    console.error('Failed to rename field', error)
  }
}

function getFieldTitle(annotation: WidgetLikeAnnotation) {
  const name = annotation.formFieldName ?? ''

  if (name.startsWith('signature-')) return 'Signature'
  if (name.startsWith('initials-')) return 'Initials'
  if (name.startsWith('date-signed-')) return 'Date signed'
  if (name.startsWith('full-name-')) return 'Full name'
  if (name.startsWith('email-')) return 'Email address'
  if (name.startsWith('title-')) return 'Title'
  if (name.startsWith('company-')) return 'Company'
  if (name.startsWith('checkbox-')) return 'Checkbox'
  return 'Textbox'
}

function getFieldIcon(title: string) {
  if (title === 'Date signed') return getIcon('calendar')
  if (title === 'Checkbox') return getIcon('checkbox')
  if (title === 'Signature' || title === 'Initials') return getIcon('edit')
  return getIcon('textbox')
}

// Raw SVG strings because the field editor renders via innerHTML (we don't
// have React inside the SDK iframe's slot DOM).
function getIcon(icon: 'trash' | 'edit' | 'calendar' | 'checkbox' | 'textbox') {
  const paths = {
    trash: '<path d="M4 6h12M8 6V4h4v2M6 6l1 11h6l1-11M9 9v5M12 9v5" />',
    edit: '<path d="M4 14.5V17h2.5L15 8.5 12.5 6 4 14.5zM11.5 7 14 9.5" />',
    calendar:
      '<path d="M3 5h14v12H3zM3 9h14M7 3v4M13 3v4M6 12h2M10 12h2M14 12h1M6 15h2M10 15h2M14 15h1" />',
    checkbox: '<path d="M4 4h12v12H4zM7 10l2 2 4-4" />',
    textbox: '<path d="M3 6h14v10H3zM7 9h6M7 12h4" />',
  }

  return `<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[icon]}</svg>`
}

function escapeHTML(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
