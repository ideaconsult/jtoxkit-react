import { Html } from '../utils/Html.jsx'
import { getPath, renderStringShorthand } from '../utils/tables.js'

// Resolve a column's cell content for a row, honoring the same render contract as the
// legacy DataTables configs: render(value, 'display', fullRow). Functions/strings may
// return HTML, which the <Html> shim sanitizes; a bare value is returned as text.
export function renderCellHtml(colDef, row) {
  const value = getPath(row, colDef.data, undefined)
  const r = colDef.render
  try {
    if (typeof r === 'function') return r(value, 'display', row)
    if (typeof r === 'string') return renderStringShorthand(value, r)
  } catch (e) {
    // A legacy config render() threw (missing global or unexpected data shape) — degrade
    // to the raw value instead of crashing the whole table.
    if (import.meta.env?.DEV) console.warn('[jtoxkit] render() failed for column', colDef.title, e)
  }
  if (value == null) return colDef.defaultContent ?? ''
  if (typeof value === 'object') return colDef.defaultContent ?? ''
  return value
}

export function DataCell({ colDef, row }) {
  return <Html as="td" className={colDef.className} html={renderCellHtml(colDef, row)} />
}
