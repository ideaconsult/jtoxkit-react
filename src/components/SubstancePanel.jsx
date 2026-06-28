import { useState } from 'react'
import { useViewerConfig } from '../context/ViewerConfig.jsx'
import { Html } from '../utils/Html.jsx'
import { decorateSubstance } from '../utils/ambit.js'
import CompositionView from './CompositionView.jsx'

// Collapsible top panel merging substance identifiers + composition into one compact widget.
//
// This deliberately mirrors the bisected STEP5 structure that renders reliably:
//   * <details open> with INLINE styles (no .jtox-top-panel class)
//   * plain text + inline spans directly inside <summary> (no wrapper div, no display:flex)
//   * tabs / dl / CompositionView are DIRECT children of <details> (no body/content wrappers)
// Wrapping the content in extra divs or styling the summary/details via the
// .jtox-top-panel* CSS classes reintroduced a Chromium <details> bug where the panel
// "flashes then hides". Keep this structure.
const PANEL_STYLE = {
  background: '#fff', border: '1px solid #dde1e9', borderRadius: '10px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)', marginBottom: '4px'
}
const SUMMARY_STYLE = {
  padding: '11px 16px', cursor: 'pointer', fontSize: '17px', fontWeight: 600,
  color: '#1a1d26', borderBottom: '1px solid #eaecf0', userSelect: 'none'
}
const TABS_STYLE = { padding: '0 14px', marginTop: '8px' }
const CONTENT_STYLE = { padding: '14px' }

export default function SubstancePanel({ substance, compositionUri }) {
  const [tab, setTab] = useState('identifiers')
  const { apiBase } = useViewerConfig()

  if (!substance) return null
  const s = decorateSubstance(substance)
  const ownerLink = s.ownerUUID ? `${apiBase}/substanceowner/${s.ownerUUID}/substance` : null

  return (
    <details open style={PANEL_STYLE}>
      <summary style={SUMMARY_STYLE}>
        {s.showname || '(unnamed substance)'}
        {s.substanceType && <span className="tag" style={{ marginLeft: 10 }}>{s.substanceType}</span>}
      </summary>

      <div className="jtox-tabs" style={TABS_STYLE}>
        <button
          type="button"
          className={'jtox-tab' + (tab === 'identifiers' ? ' active' : '')}
          onClick={() => setTab('identifiers')}
        >
          Identifiers
        </button>
        {compositionUri && (
          <button
            type="button"
            className={'jtox-tab' + (tab === 'composition' ? ' active' : '')}
            onClick={() => setTab('composition')}
          >
            Composition
          </button>
        )}
      </div>

      {tab === 'identifiers' && (
        <dl className="jtox-card-grid" style={CONTENT_STYLE}>
          {s.publicname && (
            <div className="jtox-field"><dt>Public name</dt><dd>{s.publicname}</dd></div>
          )}
          {s.name && s.name !== s.publicname && (
            <div className="jtox-field"><dt>Name</dt><dd>{s.name}</dd></div>
          )}
          {s.ownerName && (
            <div className="jtox-field">
              <dt>Owner</dt>
              <dd>
                {ownerLink
                  ? <a href={ownerLink} target="_blank" rel="noreferrer">{s.ownerName}</a>
                  : s.ownerName}
              </dd>
            </div>
          )}
          {s.i5uuid && (
            <div className="jtox-field"><dt>UUID</dt><dd className="jtox-mono">{s.i5uuid}</dd></div>
          )}
          {s.extIdentifiersHtml && (
            <div className="jtox-field"><dt>Identifiers</dt><dd><Html html={s.extIdentifiersHtml} /></dd></div>
          )}
        </dl>
      )}

      {tab === 'composition' && compositionUri && (
        <div style={CONTENT_STYLE}>
          <CompositionView compositionUri={compositionUri} compact />
        </div>
      )}
    </details>
  )
}
