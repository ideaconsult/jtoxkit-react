import { useEffect } from 'react'
import { ViewerConfigProvider, useViewerConfig } from './context/ViewerConfig.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { DataSourceProvider } from './context/DataSource.jsx'
import { useSubstance, useStudySummary } from './hooks/useAmbit.js'
import SubstanceCard from './components/SubstanceCard.jsx'
import CompositionView from './components/CompositionView.jsx'
import StudyViewer from './components/StudyViewer.jsx'
import './styles/viewer.css'

// Drives the AMBIT load sequence (StudyKit.querySubstance): substance → studysummary,
// with composition fetched by CompositionView. Inputs arrive as props (no URL parsing);
// the standalone App / an embedding host decides what to show.
function ViewerBody({ substanceUri, substanceId, initialTab, showHeader }) {
  const { apiBase } = useViewerConfig()
  const { load: loadSubstance, data: substance, loading, error } = useSubstance()
  const { load: loadSummary, data: summary } = useStudySummary()

  const target = substanceUri || (substanceId ? `substance/${substanceId}` : null)
  useEffect(() => {
    if (target) loadSubstance(target)
  }, [target, loadSubstance])

  const substanceURI = substance?.URI
  useEffect(() => {
    if (substanceURI) loadSummary(substanceURI + '/studysummary')
  }, [substanceURI, loadSummary])

  if (!target) {
    return <div className="jtox-empty">No substance specified — pass <code>substanceUri</code> or <code>substanceId</code> + <code>apiBase</code>.</div>
  }
  if (loading) return <div className="jtox-loading jtox-loading-block">Loading substance…</div>
  if (error) return <div className="jtox-error jtox-error-block">Error loading substance: {error}</div>
  if (!substance) return <div className="jtox-empty">Substance not found.</div>

  return (
    <div className="jtox-viewer">
      {showHeader && (
        <header className="jtox-header">
          <span className="jtox-header-title">{substance.publicname || substance.name || 'Substance'}</span>
          <span className="jtox-header-sub">{apiBase}</span>
        </header>
      )}
      <SubstanceCard substance={substance} />
      {substanceURI && <CompositionView compositionUri={substanceURI + '/composition'} />}
      {summary?.length ? <StudyViewer summary={summary} initialTab={initialTab} /> : null}
    </div>
  )
}

// Public component. Auth: `token` (when provided) is owned by the host; omitted ⇒
// standalone reads URL/sessionStorage. Config: apiBase / showDiagrams / columnConfig
// override the build-time env defaults. `source` injects a custom data source (defaults
// to the AMBIT REST adapter).
export default function SubstanceStudyViewer({
  token, apiBase, showDiagrams, columnConfig, source, ...body
}) {
  const configValue = { apiBase, showDiagrams, columnConfig }
  return (
    <ViewerConfigProvider value={configValue}>
      <AuthProvider token={token ?? undefined}>
        <DataSourceProvider source={source}>
          <div className="jtoxkit-root">
            <ViewerBody {...body} />
          </div>
        </DataSourceProvider>
      </AuthProvider>
    </ViewerConfigProvider>
  )
}

export { useAuth }
