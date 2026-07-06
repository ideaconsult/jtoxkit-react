import { createContext, useContext, useMemo } from 'react'

// Runtime configuration for the viewer. Embedded hosts and the standalone app shell pass
// these as props so published library code stays independent from Vite env variables.
const ViewerConfigContext = createContext(null)

export const DEFAULT_VIEWER_CONFIG = {
  apiBase: '',
  // ramanchada-api base, used only for the dose-response conversion endpoint
  // (POST {convertBase}/dataset/convert?format=effectarray). AMBIT substance/study reads
  // still go direct to apiBase. Empty means the dose-response chart is not offered.
  convertBase: '',
  showDiagrams: false,
  // null ⇒ StudyTable uses the bundled default study config (config_study)
  columnConfig: null,
  // Optional: rewrite absolute AMBIT URLs onto a same-origin proxy to avoid CORS.
  proxyFrom: '',
  proxyTo: ''
}

export function ViewerConfigProvider({ value, children }) {
  // Strip undefined/null overrides so they fall back to package defaults.
  const merged = useMemo(() => {
    const clean = Object.fromEntries(
      Object.entries(value || {}).filter(([, v]) => v !== undefined && v !== null)
    )
    return {
      ...DEFAULT_VIEWER_CONFIG,
      ...clean,
      apiBase: (clean.apiBase ?? DEFAULT_VIEWER_CONFIG.apiBase).replace(/\/$/, ''),
      convertBase: (clean.convertBase ?? DEFAULT_VIEWER_CONFIG.convertBase).replace(/\/$/, '')
    }
  }, [value])

  return (
    <ViewerConfigContext.Provider value={merged}>
      {children}
    </ViewerConfigContext.Provider>
  )
}

export const useViewerConfig = () => useContext(ViewerConfigContext) || DEFAULT_VIEWER_CONFIG
