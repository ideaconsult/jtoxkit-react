import SubstanceStudyViewer from './SubstanceStudyViewer'

// Standalone dev entry: read what to show from the URL. Embedded hosts pass props
// instead (see PredictionsPage.jsx in spectrasearch-viewers for the qubounds analogue).
//   ?substanceUri=<full AMBIT substance URL>
//   ?substanceId=<uuid>&apiBase=<AMBIT base>
//   ?showDiagrams=true&tab=TOX
//   ?convertBase=<ramanchada-api base>   — enables the dose-response chart (POST
//      {convertBase}/dataset/convert?format=effectarray). Without it the chart is hidden.
//      Falls back to VITE_RCAPI_URL for convenience while testing.
export default function App() {
  const params = new URLSearchParams(window.location.search)
  return (
    <SubstanceStudyViewer
      substanceUri={params.get('substanceUri') || undefined}
      substanceId={params.get('substanceId') || undefined}
      apiBase={params.get('apiBase') || undefined}
      convertBase={params.get('convertBase') || import.meta.env.VITE_RCAPI_URL || undefined}
      showDiagrams={params.get('showDiagrams') === 'true'}
      initialTab={params.get('tab') || undefined}
      showHeader
    />
  )
}
