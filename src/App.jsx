import SubstanceStudyViewer from './SubstanceStudyViewer'

// Standalone dev entry: read what to show from the URL. Embedded hosts pass props
// instead (see PredictionsPage.jsx in spectrasearch-viewers for the qubounds analogue).
//   ?substanceUri=<full AMBIT substance URL>
//   ?substanceId=<uuid>&apiBase=<AMBIT base>
//   ?showDiagrams=true&tab=TOX
export default function App() {
  const params = new URLSearchParams(window.location.search)
  return (
    <SubstanceStudyViewer
      substanceUri={params.get('substanceUri') || undefined}
      substanceId={params.get('substanceId') || undefined}
      apiBase={params.get('apiBase') || undefined}
      showDiagrams={params.get('showDiagrams') === 'true'}
      initialTab={params.get('tab') || undefined}
      showHeader
    />
  )
}
