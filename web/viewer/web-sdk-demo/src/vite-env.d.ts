/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SDK_BASE_URL?: string
  readonly VITE_LICENSE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
