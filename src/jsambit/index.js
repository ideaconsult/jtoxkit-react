// jsambit — a small, dependency-free JS counterpart to pyambit's EffectArray model.
//
// It consumes the JSON produced by ramanchada-api `POST /dataset/convert?format=effectarray`
// (pyambit `convert_effectrecords2array`) and exposes helpers to drive the dose-response
// chart and CSV/JSON export. No React, no chart lib — pure data, reusable by any host.
//
// Shape of one converted study (from the backend):
//   { document_uuid, substance:{i5uuid,name,publicname}, protocol, citation,
//     arrays: [ { endpoint, endpointtype, conditions:{...},
//                 signal:{ unit, values:[...], errQualifier, errorValue:[...]|null },
//                 axes:{ CONCENTRATION:{ unit, values:[...] }, ... },
//                 axis_groups: null | { PRIMARY:[alt,...] } } ],
//     error }
// pyambit already splits records by the non-numeric conditions, so each Treatment /
// control type / facet is its own array (the panels/series of the chart).

const CONC_RE = /^concentration/i

// ---- parsing / normalization ----------------------------------------------

function normalizeAxis(axis) {
  if (!axis) return null
  return {
    unit: axis.unit ?? null,
    values: Array.isArray(axis.values) ? axis.values : [],
  }
}

function normalizeArray(a) {
  const axes = {}
  for (const [name, axis] of Object.entries(a.axes || {})) {
    axes[name] = normalizeAxis(axis)
  }
  const sig = a.signal || {}
  return {
    endpoint: a.endpoint ?? null,
    endpointtype: a.endpointtype ?? null,
    conditions: a.conditions || {},
    signal: {
      unit: sig.unit ?? null,
      values: Array.isArray(sig.values) ? sig.values : [],
      errQualifier: sig.errQualifier ?? null,
      errorValue: Array.isArray(sig.errorValue) ? sig.errorValue : null,
    },
    axes,
    axisGroups: a.axis_groups || null,
  }
}

// Parse the backend response (`{ datasets:[...] }` or a bare array of studies) into a
// normalized list of studies, each with normalized `arrays`.
export function parseConversion(json) {
  const studies = Array.isArray(json) ? json : json?.datasets || []
  return studies.map((s) => ({
    documentUuid: s.document_uuid ?? null,
    substance: s.substance || null,
    protocol: s.protocol || null,
    citation: s.citation || null,
    error: s.error ?? null,
    arrays: (s.arrays || []).map(normalizeArray),
  }))
}

// ---- dose axis -------------------------------------------------------------

// The primary dose axis for an array: honor axis_groups' primary key, else the first
// axis whose name starts with CONCENTRATION, else the first axis. Returns
// { name, unit, values } or null.
export function primaryDoseAxis(arr) {
  const axes = arr?.axes || {}
  const names = Object.keys(axes)
  if (!names.length) return null
  let name =
    (arr.axisGroups && Object.keys(arr.axisGroups)[0]) ||
    names.find((n) => CONC_RE.test(n)) ||
    names[0]
  const axis = axes[name]
  if (!axis) return null
  return { name, unit: axis.unit, values: axis.values }
}

// ---- controls --------------------------------------------------------------

// Classify an array's role from its (already-grouped) conditions. pyambit puts the
// control designation in a string condition such as `Treatment` = "positive control".
// Returns one of: 'positive' | 'negative' | 'interference' | 'vehicle' | 'control' | 'test'.
export function classifyControl(conditions) {
  if (!conditions) return 'test'
  let text = ''
  for (const [k, v] of Object.entries(conditions)) {
    if (/treatment|control/i.test(k) && v != null) text += ' ' + String(v)
  }
  text = text.toLowerCase()
  if (!text.trim()) {
    // some datasets only carry the value (e.g. {"Treatment":"positive control"})
    text = Object.values(conditions).map((v) => String(v ?? '')).join(' ').toLowerCase()
  }
  if (text.includes('positive')) return 'positive'
  if (text.includes('interference')) return 'interference'
  if (text.includes('vehicle') || text.includes('blank') || text.includes('solvent')) return 'vehicle'
  if (text.includes('negative')) return 'negative'
  if (text.includes('control')) return 'control'
  return 'test'
}

export const isControl = (conditions) => classifyControl(conditions) !== 'test'

// A short human label for an array's series, built from its conditions (falls back to
// the endpoint). Used for legends / control labels.
export function seriesLabel(arr) {
  const parts = Object.entries(arr?.conditions || {}).map(([k, v]) => `${k}: ${v}`)
  return parts.length ? parts.join(', ') : arr?.endpoint || '—'
}

// ---- plot series -----------------------------------------------------------

// Flatten one normalized array into chart points against its primary dose axis.
// Returns [{ x, y, ylo, yhi, controlRole, series, endpoint, yUnit, xUnit }]. Points with
// a non-finite x or y are dropped; under { logX } non-positive x is dropped too (log axis).
// Error bars come from signal.errorValue when its qualifier is a spread (SD/SEM/…).
export function toPlotSeries(arr, { logX = false } = {}) {
  const axis = primaryDoseAxis(arr)
  if (!axis) return []
  const xs = axis.values
  const ys = arr.signal.values
  const errs = arr.signal.errorValue
  const role = classifyControl(arr.conditions)
  const label = seriesLabel(arr)
  const n = Math.min(xs.length, ys.length)
  const out = []
  for (let i = 0; i < n; i++) {
    const x = Number(xs[i])
    const y = Number(ys[i])
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    if (logX && x <= 0) continue
    const e = errs && Number.isFinite(Number(errs[i])) ? Number(errs[i]) : null
    out.push({
      x,
      y,
      ylo: e == null ? null : y - e,
      yhi: e == null ? null : y + e,
      err: e,
      errQualifier: arr.signal.errQualifier || null,
      controlRole: role,
      series: label,
      endpoint: arr.endpoint,
      yUnit: arr.signal.unit,
      xUnit: axis.unit,
    })
  }
  return out
}

// ---- panels ----------------------------------------------------------------

// Group a study's arrays into panels with a consistent X/Y — keyed by
// (endpoint, endpointtype, result unit, dose unit) — so units are never mixed on an axis.
// Each panel = { key, endpoint, endpointtype, yUnit, xUnit, arrays:[...] }.
export function panelsForStudy(study) {
  const panels = new Map()
  for (const arr of study.arrays || []) {
    const axis = primaryDoseAxis(arr)
    const key = [arr.endpoint, arr.endpointtype, arr.signal.unit, axis?.unit].join(' | ')
    if (!panels.has(key)) {
      panels.set(key, {
        key,
        endpoint: arr.endpoint,
        endpointtype: arr.endpointtype,
        yUnit: arr.signal.unit,
        xUnit: axis?.unit ?? null,
        arrays: [],
      })
    }
    panels.get(key).arrays.push(arr)
  }
  return [...panels.values()]
}

// True when a study has at least one array with a dose axis and ≥1 numeric point — i.e.
// it is worth offering the dose-response chart.
export function isDoseResponse(study, { minPoints = 1 } = {}) {
  let pts = 0
  for (const arr of study?.arrays || []) {
    if (!primaryDoseAxis(arr)) continue
    pts += toPlotSeries(arr).length
    if (pts >= minPoints) return true
  }
  return false
}

// Cheap pre-check on RAW AMBIT studies (before conversion): does any effect carry a
// CONCENTRATION-like condition? Used to decide whether to offer the dose-response toggle
// without paying for a conversion round-trip.
export function ambitHasConcentration(studies) {
  for (const s of studies || []) {
    for (const e of s.effects || []) {
      for (const k of Object.keys(e.conditions || {})) {
        if (CONC_RE.test(k)) return true
      }
    }
  }
  return false
}

// ---- export ----------------------------------------------------------------

// Flatten studies to long-format rows for CSV/JSON export.
export function toLongRows(studies) {
  const rows = []
  for (const study of studies || []) {
    for (const arr of study.arrays || []) {
      const axis = primaryDoseAxis(arr)
      const role = classifyControl(arr.conditions)
      const xs = axis?.values || []
      const ys = arr.signal.values
      const errs = arr.signal.errorValue
      const n = Math.min(xs.length, ys.length)
      for (let i = 0; i < n; i++) {
        rows.push({
          document_uuid: study.documentUuid,
          substance: study.substance?.name ?? '',
          endpoint: arr.endpoint,
          endpointtype: arr.endpointtype ?? '',
          control_role: role,
          conditions: JSON.stringify(arr.conditions || {}),
          dose_axis: axis?.name ?? '',
          dose: xs[i],
          dose_unit: axis?.unit ?? '',
          response: ys[i],
          response_unit: arr.signal.unit ?? '',
          error: errs && errs[i] != null ? errs[i] : '',
          error_qualifier: arr.signal.errQualifier ?? '',
        })
      }
    }
  }
  return rows
}

// Serialize long rows to a CSV string (simple RFC-4180-ish quoting).
export function toCsv(rows) {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0])
  const esc = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const lines = [cols.join(',')]
  for (const r of rows) lines.push(cols.map((c) => esc(r[c])).join(','))
  return lines.join('\n')
}
