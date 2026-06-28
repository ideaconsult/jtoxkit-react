import { useEffect, useMemo } from 'react'
import { useComposition } from '../hooks/useAmbit.js'
import { useViewerConfig } from '../context/ViewerConfig.jsx'
import { compositionColumns } from '../config/compositionColumns.js'
import { DataCell } from './DataCell.jsx'
import { Html } from '../utils/Html.jsx'
import { valueAndUnits } from '../utils/format.js'
import { getDiagramUri } from '../utils/ambit.js'

const PCT = '%&nbsp;(w/w)'

// Group composition rows by compositionUUID and derive a banner name/purity, like
// CompositionKit.queryComposition.
function groupComposition(list) {
  const groups = {}
  for (const cmp of list) {
    const id = cmp.compositionUUID
    let g = groups[id]
    if (!g) g = groups[id] = { name: '', purity: '', maxvalue: 0, uuid: id, composition: [] }
    g.composition.push(cmp)
    if (cmp.compositionName) g.name = cmp.compositionName
    const val = cmp.proportion?.typical
    if (cmp.relation === 'HAS_CONSTITUENT' && !g.name) {
      g.name = (cmp.component?.compound?.name || '') + ' (' + valueAndUnits(val?.value, val?.unit || PCT, val?.precision) + ')'
    }
    if (cmp.relation === 'HAS_CONSTITUENT' && g.maxvalue < (val?.value ?? 0)) {
      g.maxvalue = val.value
      const real = cmp.proportion?.real
      g.purity = valueAndUnits((real?.lowerValue ?? '') + '-' + (real?.upperValue ?? ''), real?.unit || PCT)
    }
  }
  return Object.values(groups)
}

// compact=true: used inside SubstancePanel — omits the section wrapper (panel provides it)
export default function CompositionView({ compositionUri, compact = false }) {
  const { apiBase, showDiagrams } = useViewerConfig()
  const { load, data, loading, error } = useComposition()

  useEffect(() => {
    if (compositionUri) load(compositionUri)
  }, [compositionUri, load])

  const groups = useMemo(() => groupComposition(data?.composition || []), [data])

  // Inject the runtime-dependent "Also" link + optional structure diagram column.
  const columns = useMemo(() => {
    const cols = compositionColumns.map((c) =>
      c.title === 'Also'
        ? {
            ...c,
            render: (val) =>
              val
                ? '<a href="' + apiBase + '/substance?type=related&compound_uri=' + encodeURIComponent(val) + '" target="_blank" rel="noreferrer">Also contained in…</a>'
                : ''
          }
        : c
    )
    if (showDiagrams) {
      cols.push({
        title: 'Structure', className: 'center', data: 'component',
        render: (val) => {
          const u = getDiagramUri(val?.compound?.URI)
          return u ? '<img class="jtox-structure" src="' + u + '" alt="structure"/>' : ''
        }
      })
    }
    return cols
  }, [apiBase, showDiagrams])

  if (!compositionUri) return null
  if (loading) return <div className={compact ? '' : 'jtox-section'}><div className="jtox-loading">Loading composition…</div></div>
  if (error) return <div className={compact ? '' : 'jtox-section'}><div className="jtox-error">Composition error: {error}</div></div>
  if (!groups.length) return null

  const body = groups.map((g) => (
    <div key={g.uuid} className="jtox-composition">
      {(g.name || g.purity) && (
        <div className="jtox-composition-banner">
          {g.name && <Html className="jtox-composition-name" html={g.name} />}
          {g.purity && (
            <span className="jtox-composition-purity">Purity: <Html html={g.purity} /></span>
          )}
        </div>
      )}
      <div className="jtox-table-wrap">
        <table className="jtox-table">
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i} className={c.className}>{c.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {g.composition.map((cmp, ri) => (
              <tr key={ri}>
                {columns.map((c, ci) => (
                  <DataCell key={ci} colDef={c} row={cmp} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ))

  if (compact) return <div className="jtox-section">{body}</div>

  return (
    <div className="jtox-section">
      <h3 className="jtox-section-title">Composition</h3>
      {body}
    </div>
  )
}
