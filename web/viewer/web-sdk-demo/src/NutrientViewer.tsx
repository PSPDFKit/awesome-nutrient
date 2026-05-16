import { useEffect, useMemo, useRef, useState } from 'react'
import { demoDarkTheme } from './theme'
import {
  createAnnotationTooltipItems,
  createFieldPropertyEditorSlotBridge,
  installFormCreatorModeRestore,
} from './form-creator'
import type { SDKInstance } from './types/global'

// The SDK is loaded via the `<script src="...nutrient-viewer.js">` tag in
// index.html. The SDK auto-detects its asset `baseUrl` from that script's
// origin, so we don't need to pass one explicitly.
const LICENSE_KEY = import.meta.env.VITE_LICENSE_KEY as string | undefined

const HIDDEN_SLOT = () => ({ render: () => null })

type Props = {
  documentUrl: string
  onInstance: (instance: SDKInstance | null) => void
  onOpenSignatureModal: (instance: SDKInstance) => void
  hideContextualToolbar?: boolean
}

export function NutrientViewer({
  documentUrl,
  onInstance,
  onOpenSignatureModal,
  hideContextualToolbar = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [readyInstance, setReadyInstance] = useState<SDKInstance | null>(null)

  // Stable slot bridges — recreating them would re-mount the slot DOM each
  // time `setUI` runs.
  const signatureSlot = useMemo(
    () => createSignatureSlotBridge(onOpenSignatureModal),
    [onOpenSignatureModal],
  )
  const fieldEditorSlot = useMemo(() => createFieldPropertyEditorSlotBridge(), [])

  // `setUI` replaces the entire config (it does not merge), so every
  // customization — main toolbar hidden, signatures, field editor — has to
  // live here, not just the slot we want to toggle.
  const uiConfig = useMemo(
    () => ({
      tools: {
        main: HIDDEN_SLOT,
        ...(hideContextualToolbar ? { contextual: HIDDEN_SLOT } : {}),
      },
      signatures: {
        create: signatureSlot,
        list: signatureSlot,
      },
      formCreator: {
        propertyEditor: fieldEditorSlot,
      },
    }),
    [hideContextualToolbar, signatureSlot, fieldEditorSlot],
  )

  // Capture the initial UI config for load(). Subsequent changes go through
  // setUI in a separate effect so toggling `hideContextualToolbar` doesn't
  // re-load the document.
  const initialUIConfigRef = useRef(uiConfig)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const sdk = window.NutrientViewer
    if (!sdk) {
      console.error(
        'NutrientViewer global not found. Make sure the <script src="...nutrient-viewer.js"> tag in index.html resolved.',
      )
      return
    }

    let cancelled = false
    let uninstallModeRestore: (() => void) | null = null
    let loadedInstance: SDKInstance | null = null

    sdk
      .load({
        container,
        document: documentUrl,
        licenseKey: LICENSE_KEY,
        // Single source of truth for theming — same object as <ThemeProvider>
        // in main.tsx. PSPDFKit's Configuration accepts `ITheme | BUITheme`
        // directly and forwards it into its internal <ThemeProvider>.
        theme: demoDarkTheme,
        styleSheets: [`${window.location.origin}/sdk-overrides.css`],
        // History enabled so the floating ink toolbar's Undo has steps.
        enableHistory: true,
        // Every text annotation gets the rich-text editor (with formatting
        // controls) instead of the plain editor.
        enableRichText: () => true,
        annotationTooltipCallback: (annotation: unknown) =>
          createAnnotationTooltipItems(loadedInstance, annotation as { formFieldName?: string }),
        ui: initialUIConfigRef.current,
        initialViewState: new sdk.ViewState({
          sidebarMode: sdk.SidebarMode.THUMBNAILS,
          sidebarWidth: 180,
        }),
      })
      .then((instance) => {
        if (cancelled) {
          sdk.unload(container)
          return
        }
        loadedInstance = instance as SDKInstance
        uninstallModeRestore = installFormCreatorModeRestore(loadedInstance)
        setReadyInstance(loadedInstance)
        onInstance(loadedInstance)
      })
      .catch((err: unknown) => {
        console.error('Nutrient Web SDK failed to load', err)
      })

    return () => {
      cancelled = true
      uninstallModeRestore?.()
      setReadyInstance(null)
      onInstance(null)
      sdk.unload(container)
    }
  }, [documentUrl, onInstance, onOpenSignatureModal])

  // Re-apply the full UI config when `hideContextualToolbar` (or any other
  // dependency) changes. Skip the first run because load() already mounted
  // with `initialUIConfigRef.current`.
  const isFirstUIApplyRef = useRef(true)
  useEffect(() => {
    if (!readyInstance) return
    if (isFirstUIApplyRef.current && uiConfig === initialUIConfigRef.current) {
      isFirstUIApplyRef.current = false
      return
    }
    readyInstance.setUI(uiConfig)
  }, [readyInstance, uiConfig])

  return <div ref={containerRef} className="viewer" />
}

function createSignatureSlotBridge(onOpenSignatureModal: (instance: SDKInstance) => void) {
  return (instance: unknown) => {
    let opened = false

    const openOnce = () => {
      if (opened) return
      opened = true
      onOpenSignatureModal(instance as SDKInstance)
    }

    return {
      onMount: openOnce,
      render: () => {
        const bridge = document.createElement('div')
        bridge.className = 'sdk-signature-slot-bridge'
        bridge.setAttribute('aria-hidden', 'true')
        queueMicrotask(openOnce)
        return bridge
      },
    }
  }
}
