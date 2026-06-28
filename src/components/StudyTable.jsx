import { useMemo } from 'react'
import { Html } from '../utils/Html.jsx'
import { renderCellHtml } from './DataCell.jsx'
import { buildStudyColumns, buildRepresentativeStudy } from '../utils/buildStudyColumns.js'

const isEffectCol = (c) => c.perEffect && typeof c.renderEffect === 'function'

function safeRenderEffect(colDef, effect) {
  if (effect == null) return colDef.defaultContent ?? ''
  try {
    return colDef.renderEffect(effect)
  } catch {
    return colDef.defaultContent ?? ''
  }
}

// Strip tags/entities so the per-tab filter matches rendered text, like DataTables search.
function strip(html) {
  return String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
}
function rowText(study, colDefs) {
  let text = ''
  const effects = Array.isArray(study.effects) ? study.effects : []
  for (const c of colDefs) {
    if (isEffectCol(c)) {
      for (const e of effects) text += ' ' + strip(safeRenderEffect(c, e))
    } else {
      text += ' ' + strip(renderCellHtml(c, study))
    }
  }
  return text.toLowerCase()
}

// One study → N table rows (one per effect). Per-study columns are emitted once on the
// first row and span all the effect rows (rowSpan), so each effect lines up as a grid row
// across the Endpoint/Result/condition columns — the aligned layout the legacy produced.
function StudyRows({ study, colDefs }) {
  const effects = Array.isArray(study.effects) && study.effects.length ? study.effects : [null]
  const n = effects.length
  return effects.map((effect, i) => (
    <tr key={i}>
      {colDefs.map((c, ci) => {
        if (isEffectCol(c)) {
          return <Html key={ci} as="td" className={c.className} html={safeRenderEffect(c, effect)} />
        }
        // per-study column: render once on the first effect row, spanning the rest
        if (i !== 0) return null
        return <Html key={ci} as="td" className={c.className} rowSpan={n} html={renderCellHtml(c, study)} />
      })}
    </tr>
  ))
}

// One category's studies as a table. Columns are derived from a representative study
// (buildStudyColumns) and overridden by the column config; cells render via the shim.
export default function StudyTable({ studies, category, columns, filter }) {
  const colDefs = useMemo(() => {
    if (!studies?.length) return []
    return buildStudyColumns(buildRepresentativeStudy(studies), category, columns)
  }, [studies, category, columns])

  const rows = useMemo(() => {
    const q = (filter || '').trim().toLowerCase()
    if (!q) return studies || []
    return (studies || []).filter((s) => rowText(s, colDefs).includes(q))
  }, [studies, colDefs, filter])

  if (!studies?.length) return null

  return (
    <div className="jtox-table-wrap">
      <table className="jtox-table">
        <thead>
          <tr>
            {colDefs.map((c, i) => (
              <th key={i} className={c.className} style={c.width ? { width: c.width } : undefined}>
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((s, ri) => (
            <StudyRows key={s.uuid || ri} study={s} colDefs={colDefs} />
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="jtox-empty">No studies match “{filter}”.</div>}
    </div>
  )
}
