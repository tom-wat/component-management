/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_ENVIRONMENT?: string
  // 後方互換性
  readonly REACT_APP_API_URL?: string
  readonly REACT_APP_ENVIRONMENT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
