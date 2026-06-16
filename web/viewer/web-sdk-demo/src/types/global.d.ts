export {}

type SDK = {
  load: (config: Record<string, unknown>) => Promise<SDKInstance>
  unload: (target: HTMLElement | string) => boolean
  ViewState: new (props?: Record<string, unknown>) => SDKViewState
  generateInstantId?: () => string
  Theme: { DARK: unknown; LIGHT: unknown; AUTO?: unknown }
  Immutable?: { List: <T>(items: T[]) => unknown }
  Geometry?: {
    Rect?: new (...args: unknown[]) => unknown
    Point?: new (...args: unknown[]) => unknown
  }
  Rect?: new (...args: unknown[]) => unknown
  Annotations?: {
    WidgetAnnotation?: new (...args: unknown[]) => { id: string }
    ImageAnnotation?: new (...args: unknown[]) => unknown
    InkAnnotation?: new (...args: unknown[]) => unknown
    TextAnnotation?: new (...args: unknown[]) => unknown
  }
  WidgetAnnotation?: new (...args: unknown[]) => { id: string }
  ImageAnnotation?: new (...args: unknown[]) => unknown
  FormFields?: {
    TextFormField?: new (...args: unknown[]) => unknown
    CheckBoxFormField?: new (...args: unknown[]) => unknown
    SignatureFormField?: new (...args: unknown[]) => unknown
  }
  TextFormField?: new (...args: unknown[]) => unknown
  CheckBoxFormField?: new (...args: unknown[]) => unknown
  SignatureFormField?: new (...args: unknown[]) => unknown
  FormOption?: new (...args: unknown[]) => unknown
  SidebarMode: {
    NONE: unknown
    THUMBNAILS: unknown
    ANNOTATIONS?: unknown
    [key: string]: unknown
  }
  ZoomMode: { AUTO: unknown; FIT_TO_WIDTH: unknown; FIT_TO_VIEWPORT: unknown }
  InteractionMode: {
    SEARCH: unknown
    INK: unknown
    TEXT_HIGHLIGHTER: unknown
    TEXT: unknown
    CONTENT_EDITOR: unknown
    SIGNATURE: unknown
    FORM_CREATOR?: unknown
    PAN: unknown
    [key: string]: unknown
  }
  [key: string]: unknown
}

type SDKViewState = {
  currentPageIndex: number
  zoom: number
  sidebarMode: unknown
  interactionMode: unknown
  set: (key: string, value: unknown) => SDKViewState
  zoomIn: () => SDKViewState
  zoomOut: () => SDKViewState
}

type SDKAnnotation = {
  id: string
  pageIndex: number
  formFieldName?: string
  boundingBox?: unknown
  constructor: { name: string }
}

export type SDKInstance = {
  viewState: SDKViewState
  totalPageCount: number
  currentZoomLevel: number
  contentDocument: Document
  history: {
    undo: () => Promise<boolean>
    redo: () => Promise<boolean>
    canUndo: () => boolean
    canRedo: () => boolean
  }
  setViewState: (
    update: SDKViewState | ((vs: SDKViewState) => SDKViewState),
  ) => void
  exportPDF: () => Promise<ArrayBuffer>
  applyOperations: (ops: Array<Record<string, unknown>>) => Promise<unknown>
  create: (annotationOrList: unknown) => Promise<unknown>
  delete: (idOrList: unknown) => Promise<unknown>
  update: (objectOrList: unknown) => Promise<unknown>
  createAttachment: (blob: Blob) => Promise<string>
  getFormFields: () => Promise<{
    toArray: () => Array<{
      id?: string
      name: string
      set?: (key: string, value: unknown) => unknown
    }>
  }>
  getAnnotations: (pageIndex: number) => Promise<{
    toArray: () => SDKAnnotation[]
  }>
  getSelectedAnnotations?: () =>
    | {
        first?: () => unknown
        get?: (index: number) => unknown
        size?: number
      }
    | null
  setSelectedAnnotations?: (annotationsOrIds: unknown) => void
  setAnnotationPresets: (
    update: (presets: Record<string, Record<string, unknown>>) => Record<string, Record<string, unknown>>,
  ) => void
  setCurrentAnnotationPreset: (annotationPresetID?: string | null) => void
  // Text-annotation editor namespace. Routes through the rich-text editor
  // (Slate) in EDITING mode, and updates the annotation model in SELECTED
  // mode. Each method requires exactly one TextAnnotation selected.
  annotations?: {
    text?: {
      setTextStyle: (
        options: { bold?: boolean; italic?: boolean; underline?: boolean },
        annotationOrId?: unknown,
      ) => void
      setFontFamily: (family: string, annotationOrId?: unknown) => void
      setFontSize: (size: number, annotationOrId?: unknown) => void
      setFontColor: (color: unknown, annotationOrId?: unknown) => void
      setBackgroundColor: (color: unknown | null, annotationOrId?: unknown) => void
    }
  }
  setUI: (configuration: Record<string, unknown>) => void
  transformContentClientToPageSpace: <T>(rectOrPoint: T, pageIndex: number) => T
  addEventListener: (name: string, fn: (...args: unknown[]) => void) => void
  removeEventListener: (name: string, fn: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    NutrientViewer?: SDK
  }
}
