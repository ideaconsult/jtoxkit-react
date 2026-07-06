import SubstanceStudyViewer from './SubstanceStudyViewer'

const ENV = import.meta.env || {}

// Standalone dev entry: read what to show from the URL and Vite env. Embedded hosts pass
// equivalent values as props instead.
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
      apiBase={params.get('apiBase') || ENV.VITE_AMBIT_URL || undefined}
      convertBase={params.get('convertBase') || ENV.VITE_RCAPI_URL || undefined}
      proxyFrom={ENV.VITE_AMBIT_PROXY_FROM || undefined}
      proxyTo={ENV.VITE_AMBIT_PROXY_TO || undefined}
      showDiagrams={params.get('showDiagrams') === 'true'}
      initialTab={params.get('tab') || undefined}
      showHeader
    />
  )
}
