import { useEffect, useMemo, useState } from 'react'
import { Html } from '../utils/Html.jsx'
import { renderCellHtml } from './DataCell.jsx'
import { buildStudyColumns, buildRepresentativeStudy } from '../utils/buildStudyColumns.js'

const PAGE_SIZE = 20

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
// Column widths are intentionally NOT set as inline styles — table-layout:auto distributes
// space by content so no group of columns gets artificially cramped.
export default function StudyTable({ studies, category, columns, filter }) {
  const [page, setPage] = useState(0)

  const colDefs = useMemo(() => {
    if (!studies?.length) return []
    return buildStudyColumns(buildRepresentativeStudy(studies), category, columns)
  }, [studies, category, columns])

  const filtered = useMemo(() => {
    const q = (filter || '').trim().toLowerCase()
    if (!q) return studies || []
    return (studies || []).filter((s) => rowText(s, colDefs).includes(q))
  }, [studies, colDefs, filter])

  // Reset to page 0 whenever the filter or category changes.
  useEffect(() => { setPage(0) }, [filter, category])

  if (!studies?.length) return null

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const rows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="jtox-table-wrap">
      <table className="jtox-table">
        <thead>
          <tr>
            {colDefs.map((c, i) => (
              <th key={i} className={c.className}>
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
      {filtered.length === 0 && filter && (
        <div className="jtox-empty">No studies match &ldquo;{filter}&rdquo;.</div>
      )}
      {totalPages > 1 && (
        <div className="jtox-pagination">
          <button
            type="button"
            className="jtox-page-btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ← Prev
          </button>
          <span className="jtox-page-info">
            {page + 1} / {totalPages} &nbsp;({filtered.length} studies)
          </span>
          <button
            type="button"
            className="jtox-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
