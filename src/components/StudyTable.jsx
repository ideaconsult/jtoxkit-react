import { useMemo } from 'react'
import { DataCell, renderCellHtml } from './DataCell.jsx'
import { buildStudyColumns, buildRepresentativeStudy } from '../utils/buildStudyColumns.js'

// Strip tags/entities so the per-tab filter matches rendered text, like DataTables search.
function rowText(study, colDefs) {
  let text = ''
  for (const c of colDefs) {
    const html = renderCellHtml(c, study)
    text += ' ' + String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
  }
  return text.toLowerCase()
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
            <tr key={s.uuid || ri}>
              {colDefs.map((c, ci) => (
                <DataCell key={ci} colDef={c} row={s} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="jtox-empty">No studies match “{filter}”.</div>}
    </div>
  )
}
