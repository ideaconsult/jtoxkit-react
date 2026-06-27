import { createContext, useContext, useMemo } from 'react'

// Runtime configuration for the viewer. When embedded as a package, the host passes
// these as props (it has its own AMBIT base, diagram preference, column config). When
// run standalone, everything falls back to the app's Vite env vars.
const ViewerConfigContext = createContext(null)

const ENV = import.meta.env || {}

const DEFAULTS = {
  apiBase: (ENV.VITE_AMBIT_URL ?? '').replace(/\/$/, ''),
  showDiagrams: false,
  // null ⇒ StudyTable uses the bundled default study config (config_study)
  columnConfig: null,
  // Dev-only: rewrite absolute AMBIT URLs onto a same-origin proxy to avoid CORS.
  // e.g. VITE_AMBIT_PROXY_FROM=https://apps.ideaconsult.net  VITE_AMBIT_PROXY_TO=/ambit
  proxyFrom: ENV.VITE_AMBIT_PROXY_FROM || '',
  proxyTo: ENV.VITE_AMBIT_PROXY_TO || ''
}

export function ViewerConfigProvider({ value, children }) {
  // Strip undefined/null overrides so they fall back to DEFAULTS.
  const merged = useMemo(() => {
    const clean = Object.fromEntries(
      Object.entries(value || {}).filter(([, v]) => v !== undefined && v !== null)
    )
    return {
      ...DEFAULTS,
      ...clean,
      apiBase: (clean.apiBase ?? DEFAULTS.apiBase).replace(/\/$/, '')
    }
  }, [value])

  return (
    <ViewerConfigContext.Provider value={merged}>
      {children}
    </ViewerConfigContext.Provider>
  )
}

export const useViewerConfig = () => useContext(ViewerConfigContext) || DEFAULTS
