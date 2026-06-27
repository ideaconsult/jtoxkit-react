import { useViewerConfig } from '../context/ViewerConfig.jsx'
import { Html } from '../utils/Html.jsx'
import { decorateSubstance } from '../utils/ambit.js'

// Substance summary header (ports SubstanceKit.querySubstance fields + formatExtIdentifiers).
export default function SubstanceCard({ substance }) {
  const { apiBase } = useViewerConfig()
  if (!substance) return null
  const s = decorateSubstance(substance)
  const ownerLink = s.ownerUUID ? `${apiBase}/substanceowner/${s.ownerUUID}/substance` : null

  return (
    <div className="jtox-card">
      <div className="jtox-card-head">
        <h2 className="jtox-card-title">{s.showname || '(unnamed substance)'}</h2>
        {s.substanceType && <span className="tag">{s.substanceType}</span>}
      </div>
      <dl className="jtox-card-grid">
        {s.publicname && (
          <div className="jtox-field"><dt>Public name</dt><dd>{s.publicname}</dd></div>
        )}
        {s.name && s.name !== s.publicname && (
          <div className="jtox-field"><dt>Name</dt><dd>{s.name}</dd></div>
        )}
        {s.ownerName && (
          <div className="jtox-field">
            <dt>Owner</dt>
            <dd>{ownerLink ? <a href={ownerLink} target="_blank" rel="noreferrer">{s.ownerName}</a> : s.ownerName}</dd>
          </div>
        )}
        {s.i5uuid && (
          <div className="jtox-field"><dt>UUID</dt><dd className="jtox-mono">{s.i5uuid}</dd></div>
        )}
        {s.extIdentifiersHtml && (
          <div className="jtox-field"><dt>Identifiers</dt><dd><Html html={s.extIdentifiersHtml} /></dd></div>
        )}
      </dl>
    </div>
  )
}
