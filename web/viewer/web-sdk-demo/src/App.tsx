import { useCallback, useEffect, useRef, useState } from 'react'
import { FileExplorer } from './FileExplorer'
import { NutrientViewer } from './NutrientViewer'
import { Toolbar } from './Toolbar'
import { SignersPanel, type FieldType } from './signing/SignersPanel'
import { InkToolbar } from './ink/InkToolbar'
import { TextToolbar } from './text/TextToolbar'
import { SignersModal } from './signing/SignersModal'
import { SigningModal } from './signing/SigningModal'
import {
  getSavedSignatures,
  getSigners,
  type SavedSignature,
  type Signer,
} from './signing/storage'
import {
  getDataUrlContentType,
  getSignatureTargetForAnnotation,
  isSignatureWidgetAnnotation,
  resolveSignatureInsertionTarget,
  type SignatureTarget,
  type SignatureWidgetAnnotation,
} from './signing/signatureTarget'
import { getFirstSelectedAnnotation } from './lib/selection'
import { annotationIdList, isFormCreatorMode } from './lib/sdk'
import type { FileEntry } from './types/files'
import type { SDKInstance } from './types/global'

const BUILTIN_FILE: FileEntry = {
  id: 'builtin-example',
  name: 'example.pdf',
  url: '/example.pdf',
  size: 0,
  isBuiltin: true,
}

export function App() {
  const [files, setFiles] = useState<FileEntry[]>([BUILTIN_FILE])
  const filesRef = useRef<FileEntry[]>([BUILTIN_FILE])
  const [activeId, setActiveId] = useState<string>(BUILTIN_FILE.id)
  const [instance, setInstance] = useState<SDKInstance | null>(null)

  // ── Signing UI state ──
  const [signersPanelOpen, setSignersPanelOpen] = useState(false)
  const [inkOpen, setInkOpen] = useState(false)
  const [textOpen, setTextOpen] = useState(false)
  const [signersModalOpen, setSignersModalOpen] = useState(false)
  const [signers, setSigners] = useState<Signer[]>(() => getSigners())
  const [activeSignerId, setActiveSignerId] = useState<string>('me')
  const [savedSignatures, setSavedSignatures] = useState<SavedSignature[]>(() =>
    getSavedSignatures(),
  )
  const [signingModal, setSigningModal] = useState<SignatureTarget | null>(null)

  const refreshSavedSignatures = useCallback(
    () => setSavedSignatures(getSavedSignatures()),
    [],
  )

  // ── File handlers ──
  const handleUpload = useCallback((uploaded: File[]) => {
    const entries: FileEntry[] = uploaded.map((f) => ({
      id: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      url: URL.createObjectURL(f),
      size: f.size,
    }))
    setFiles((prev) => [...prev, ...entries])
    if (entries.length > 0) setActiveId(entries[0].id)
  }, [])

  const handleRemove = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const target = prev.find((f) => f.id === id)
        if (target && !target.isBuiltin) URL.revokeObjectURL(target.url)
        const next = prev.filter((f) => f.id !== id)
        if (id === activeId) setActiveId(next[0]?.id ?? '')
        return next
      })
    },
    [activeId],
  )

  useEffect(() => {
    filesRef.current = files
  }, [files])

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => {
        if (!f.isBuiltin) URL.revokeObjectURL(f.url)
      })
    }
  }, [])

  // ── Place a field at a specific page-space rect (used by drag-drop + click) ──
  const placeFieldAt = useCallback(
    async (type: FieldType, pageIndex: number, leftTop: { x: number; y: number }) => {
      if (!instance) return

      // Signatures/initials skip the form-field placeholder. Open the signing
      // modal anchored to the drop point — only the signature image is placed
      // on the page when the user inserts.
      if (type === 'signature' || type === 'initials') {
        const width = type === 'initials' ? 100 : 200
        const height = 40
        setSigningModal({
          kind: type,
          pageIndex,
          boundingBox: {
            left: Math.max(0, leftTop.x - width / 2),
            top: Math.max(0, leftTop.y - height / 2),
            width,
            height,
          },
        })
        return
      }

      const sdk = window.NutrientViewer
      if (!sdk) return
      try {
        const Rect = sdk.Geometry?.Rect ?? sdk.Rect
        const WidgetAnnotation = sdk.Annotations?.WidgetAnnotation ?? sdk.WidgetAnnotation
        const TextFormField = sdk.FormFields?.TextFormField ?? sdk.TextFormField
        const CheckBoxFormField = sdk.FormFields?.CheckBoxFormField ?? sdk.CheckBoxFormField
        const FormOption = sdk.FormOption
        const list = <T,>(items: T[]) => (sdk.Immutable?.List ? sdk.Immutable.List(items) : items)

        if (!Rect || !WidgetAnnotation) {
          console.warn('SDK Rect/WidgetAnnotation not found.')
          return
        }
        const width = type === 'checkbox' ? 24 : 200
        const height = type === 'checkbox' ? 24 : 40
        const boundingBox = new Rect({
          left: Math.max(0, leftTop.x - width / 2),
          top: Math.max(0, leftTop.y - height / 2),
          width,
          height,
        })
        const formFieldName = `${type}-${Date.now()}`
        const widget = new WidgetAnnotation({
          id: sdk.generateInstantId?.(),
          pageIndex,
          boundingBox,
          formFieldName,
        })

        const annotationIds = list([widget.id])
        const formField =
          type === 'checkbox'
            ? CheckBoxFormField &&
              new CheckBoxFormField({
                name: formFieldName,
                annotationIds,
                values: list([]),
                ...(FormOption
                  ? { options: list([new FormOption({ label: 'Yes', value: 'Yes' })]) }
                  : {}),
              })
            : TextFormField && new TextFormField({ name: formFieldName, annotationIds })

        if (!formField) {
          console.warn('SDK FormField constructor not found for field type:', type)
          window.alert(
            'Could not create this form field because the SDK form-field constructor is unavailable.',
          )
          return
        }

        await instance.create([widget, formField])
        instance.setSelectedAnnotations?.(annotationIdList([widget.id]))
      } catch (err) {
        console.error('Could not place field', err)
      }
    },
    [instance],
  )

  // Click-to-place fallback: drop near the top-left of the current page.
  const placeFieldOnDocument = useCallback(
    (type: FieldType) => {
      if (!instance) return
      placeFieldAt(type, instance.viewState.currentPageIndex, { x: 120, y: 120 })
    },
    [instance, placeFieldAt],
  )

  const openSigningModalForAnnotation = useCallback(
    (annotation: SignatureWidgetAnnotation | null, viewerInstance: SDKInstance) => {
      setSigningModal(getSignatureTargetForAnnotation(annotation, viewerInstance))
    },
    [],
  )

  const openSigningModalFromSdk = useCallback(
    (viewerInstance: SDKInstance) => {
      const annotation = getFirstSelectedAnnotation<SignatureWidgetAnnotation>(
        viewerInstance.getSelectedAnnotations?.(),
      )
      if (isSignatureWidgetAnnotation(annotation)) {
        openSigningModalForAnnotation(annotation, viewerInstance)
        return
      }

      setSigningModal(
        (current) =>
          current ?? {
            kind: 'signature',
            pageIndex: viewerInstance.viewState.currentPageIndex,
            boundingBox: { left: 80, top: 80, width: 200, height: 40 },
          },
      )
    },
    [openSigningModalForAnnotation],
  )

  // ── Drag-drop wiring inside the SDK iframe ──
  useEffect(() => {
    if (!instance) return
    const doc = instance.contentDocument
    if (!doc) return

    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('application/x-nutrient-field')) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
      }
    }

    const onDrop = async (e: DragEvent) => {
      const type = e.dataTransfer?.getData('application/x-nutrient-field') as FieldType | ''
      if (!type) return
      e.preventDefault()
      // Locate the page element under the drop point. The SDK may dispatch the
      // event from an overlay child, so fall back to hit-testing page bounds.
      const target = e.target as HTMLElement | null
      const pageEl =
        (target?.closest('[data-page-index]') as HTMLElement | null) ??
        Array.from(doc.querySelectorAll<HTMLElement>('[data-page-index]')).find((el) => {
          const rect = el.getBoundingClientRect()
          return (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          )
        })
      const pageIndex = pageEl
        ? parseInt(pageEl.dataset.pageIndex ?? '0', 10)
        : instance.viewState.currentPageIndex

      // Convert iframe-client coordinates into PDF page space.
      const sdk = window.NutrientViewer
      const PointCtor = sdk?.Geometry?.Point
      const clientPoint = PointCtor
        ? new PointCtor({ x: e.clientX, y: e.clientY })
        : { x: e.clientX, y: e.clientY }
      const pagePoint = instance.transformContentClientToPageSpace(
        clientPoint as unknown as { x: number; y: number },
        pageIndex,
      ) as unknown as { x: number; y: number }
      placeFieldAt(type, pageIndex, { x: pagePoint.x, y: pagePoint.y })
    }

    doc.addEventListener('dragover', onDragOver)
    doc.addEventListener('drop', onDrop)
    return () => {
      doc.removeEventListener('dragover', onDragOver)
      doc.removeEventListener('drop', onDrop)
    }
  }, [instance, placeFieldAt])

  // Open custom signing modal when a signature widget is selected.
  useEffect(() => {
    if (!instance) return
    const onSelectionChange = (selection: unknown) => {
      if (isFormCreatorMode(instance)) return
      const annotation = getFirstSelectedAnnotation<SignatureWidgetAnnotation>(selection)
      if (!annotation?.formFieldName) return
      if (isSignatureWidgetAnnotation(annotation)) {
        openSigningModalForAnnotation(annotation, instance)
      }
    }
    instance.addEventListener('annotationSelection.change', onSelectionChange)
    return () => {
      instance.removeEventListener('annotationSelection.change', onSelectionChange)
    }
  }, [instance, openSigningModalForAnnotation])

  const insertSignatureIntoSelected = useCallback(
    async (dataUrl: string) => {
      refreshSavedSignatures()
      if (!instance) {
        setSigningModal(null)
        return
      }
      try {
        const sdk = window.NutrientViewer!
        const ImageAnnotation = sdk.Annotations?.ImageAnnotation ?? sdk.ImageAnnotation
        const Rect = sdk.Geometry?.Rect ?? sdk.Rect
        if (!ImageAnnotation || !Rect) {
          console.warn('SDK ImageAnnotation/Rect not found — signature not inserted.')
          window.alert(
            'Could not insert the signature because image annotations are unavailable.',
          )
          return
        }

        const res = await fetch(dataUrl)
        const blob = await res.blob()
        const contentType = blob.type || getDataUrlContentType(dataUrl) || 'image/png'
        if (!instance.createAttachment) {
          window.alert('Could not insert the signature because attachments are unavailable.')
          return
        }
        const attachmentId = await instance.createAttachment(blob)
        const { pageIndex, boundingBox } = await resolveSignatureInsertionTarget(
          instance,
          signingModal,
        )
        const annotation = new ImageAnnotation({
          id: sdk.generateInstantId?.(),
          pageIndex,
          boundingBox: new Rect(boundingBox),
          description: 'Inserted signature',
          imageAttachmentId: attachmentId,
          contentType,
          isSignature: true,
        })
        await instance.create(annotation)
      } catch (err) {
        console.error('Failed to insert signature', err)
        window.alert('Could not insert the signature.')
      } finally {
        setSigningModal(null)
      }
    },
    [instance, refreshSavedSignatures, signingModal],
  )

  const activeFile = files.find((f) => f.id === activeId) ?? null

  return (
    <div className="app">
      <FileExplorer
        files={files}
        activeId={activeId}
        onSelect={setActiveId}
        onUpload={handleUpload}
        onRemove={handleRemove}
        inkActive={inkOpen}
        onToggleInk={() => {
          setInkOpen((v) => !v)
          setTextOpen(false)
        }}
        textActive={textOpen}
        onToggleText={() => {
          setTextOpen((v) => !v)
          setInkOpen(false)
        }}
      />
      <main className="app-main">
        <Toolbar
          instance={instance}
          fileName={activeFile?.name ?? null}
          savedSignatures={savedSignatures}
          onGetSignatures={() => setSignersPanelOpen(true)}
          onPickSignature={(sig) => insertSignatureIntoSelected(sig.dataUrl)}
          onEditSignatures={() =>
            setSigningModal({
              kind: 'signature',
              pageIndex: instance?.viewState.currentPageIndex ?? 0,
              boundingBox: { left: 80, top: 80, width: 200, height: 40 },
            })
          }
        />
        <div className="app-viewer">
          {activeFile ? (
            <NutrientViewer
              key={activeFile.id}
              documentUrl={activeFile.url}
              onInstance={setInstance}
              onOpenSignatureModal={openSigningModalFromSdk}
              hideContextualToolbar={inkOpen || textOpen}
            />
          ) : (
            <div className="viewer-empty">
              <p>No file selected.</p>
              <p className="viewer-empty__hint">Drag a PDF into the sidebar to get started.</p>
            </div>
          )}
          <SignersPanel
            open={signersPanelOpen}
            onClose={() => setSignersPanelOpen(false)}
            signers={signers}
            activeSignerId={activeSignerId}
            onSelectSigner={setActiveSignerId}
            onOpenSignersModal={() => setSignersModalOpen(true)}
            onPlaceField={placeFieldOnDocument}
          />
        </div>
      </main>

      {signersModalOpen && (
        <SignersModal
          initialSigners={signers}
          onClose={() => setSignersModalOpen(false)}
          onSave={(next) => {
            setSigners(next)
            setSignersModalOpen(false)
          }}
        />
      )}

      {signingModal && (
        <SigningModal
          kind={signingModal.kind}
          onClose={() => setSigningModal(null)}
          onInsert={(dataUrl) => insertSignatureIntoSelected(dataUrl)}
        />
      )}

      {inkOpen && <InkToolbar instance={instance} onClose={() => setInkOpen(false)} />}
      {textOpen && <TextToolbar instance={instance} onClose={() => setTextOpen(false)} />}
    </div>
  )
}
