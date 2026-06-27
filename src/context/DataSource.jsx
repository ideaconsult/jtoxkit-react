import { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { useViewerConfig } from './ViewerConfig'
import { createAmbitSource } from '../data/ambitSource'

// Provides the active data source. Defaults to the AMBIT REST adapter bound to the
// configured apiBase + token; a host can inject a custom source (e.g. a future Solr
// adapter) via the `source` prop on SubstanceStudyViewer.
const DataSourceContext = createContext(null)

export function DataSourceProvider({ source, children }) {
  const { token } = useAuth()
  const { apiBase, proxyFrom, proxyTo } = useViewerConfig()
  const value = useMemo(() => {
    if (source) return source
    // Dev convenience: route absolute AMBIT URLs (including the ones AMBIT returns in its
    // responses) through a same-origin proxy so the browser never makes a cross-origin call.
    const rewrite =
      proxyFrom && proxyTo
        ? (url) => (url.startsWith(proxyFrom) ? proxyTo + url.slice(proxyFrom.length) : url)
        : null
    return createAmbitSource({ apiBase, token, rewrite })
  }, [source, apiBase, token, proxyFrom, proxyTo])
  return <DataSourceContext.Provider value={value}>{children}</DataSourceContext.Provider>
}

export const useDataSource = () => useContext(DataSourceContext)
