// Ports of jT.tables column-definition helpers, decoupled from jQuery/DataTables.
// `columns` is the per-category config object, e.g. config_study.columns:
//   { [categoryCode]: { [group]: { [columnNameLower]: def } }, _: { ...defaults } }
// with group ∈ main|parameters|conditions|effects|protocol|interpretation.

// Legacy DataTables / jToxKit key aliases actually used by the bundled configs.
// (Only these appear across config_study/i5/bao/exposure/npo; mapped to modern names so
// the existing configs work verbatim. `inMatrix` is a MatrixKit-only flag, left as-is.)
const ALIASES = {
  sTitle: 'title',
  bVisible: 'visible',
  iOrder: 'order',
  sWidth: 'width',
  sClass: 'className',
  mData: 'data',
  mDataProp: 'data',
  mRender: 'render',
  sDefaultContent: 'defaultContent',
  bSortable: 'orderable',
  bSearchable: 'searchable'
}

// Map legacy Hungarian keys onto their modern equivalents (operate on a copy).
export function normalizeColDef(col) {
  for (const k in ALIASES) {
    const modern = ALIASES[k]
    if (col[k] !== undefined && col[modern] === undefined) col[modern] = col[k]
    if (k in col) delete col[k]
  }
  return col
}

// Fetch the (normalized) override for one column from a category/group, honoring a
// group-level `visible` that cascades onto the named column (jT.tables.modifyColDef).
function getOverride(columns, cat, group, name) {
  let node = columns?.[cat]
  if (node == null) return {}
  if (group) {
    node = node[group]
    if (node == null) return {}
    const named = normalizeColDef({ ...(node[name] || {}) })
    const groupNorm = normalizeColDef({ ...node })
    if (groupNorm.visible != null) named.visible = !!named.visible || !!groupNorm.visible
    return named
  }
  return normalizeColDef({ ...(node[name] || {}) })
}

// jT.tables.modifyColDef — merge base column with the `_` defaults + category override
// (category wins). Returns null when the resolved column is invisible.
export function modifyColDef(columns, baseCol, category, group) {
  if (baseCol.title == null) return null
  const name = baseCol.title.toLowerCase()
  const merged = Object.assign(
    {},
    normalizeColDef({ ...baseCol }),
    group ? getOverride(columns, '_', group, name) : {},
    getOverride(columns, category, group, name)
  )
  return merged.visible == null || merged.visible ? merged : null
}

// jT.tables.sortColDefs — stable sort by `order` (default 0); ties keep insertion order.
export function sortColDefs(colDefs) {
  colDefs.forEach((c, i) => {
    c.naturalOrder = i
  })
  colDefs.sort((a, b) => {
    const res = (a.order || 0) - (b.order || 0)
    return res === 0 ? a.naturalOrder - b.naturalOrder : res
  })
  return colDefs
}

// jT.tables.processColumns — build + sort columns for a flat (single-config) category.
export function processColumns(columns, category) {
  const colDefs = []
  const catList = columns?.[category]
  for (const name in catList) {
    const col = modifyColDef(columns, catList[name], category)
    if (col != null) colDefs.push(col)
  }
  return sortColDefs(colDefs)
}

// jT.tables.renderMulti — render an array (e.g. effects[]) as stacked sub-rows in one
// cell. renderOne(item, i) returns an HTML string; the result is an HTML string.
export function renderMulti(data, renderOne) {
  if (!Array.isArray(data)) return renderOne(data, 0)
  if (data.length < 2) return renderOne(data[0], 0)
  let out = '<div class="jtox-multi">'
  for (let i = 0; i < data.length; ++i) {
    out += '<div class="jtox-multi-row">' + (renderOne(data[i], i) ?? '') + '</div>'
  }
  out += '</div>'
  return out
}

// Safe nested getter (lodash _.get replacement) for "a.b.c" column data paths.
export function getPath(obj, path, fallback) {
  if (obj == null || path == null) return fallback
  const parts = Array.isArray(path) ? path : String(path).split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null) return fallback
    cur = cur[p]
  }
  return cur === undefined ? fallback : cur
}

// Interpret a string `render` shorthand from the legacy configs:
//   "[,]" / "[, ]" → join an array with the bracketed separator
//   otherwise      → treat as a property name on the value
export function renderStringShorthand(value, spec) {
  const m = /^\[(.*)\]$/.exec(spec)
  if (m) return Array.isArray(value) ? value.join(m[1]) : value == null ? '' : String(value)
  return value == null ? '' : String(value?.[spec] ?? '')
}
