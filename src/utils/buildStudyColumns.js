import { renderRange } from './format.js'
import { renderMulti, modifyColDef, sortColDefs } from './tables.js'

// Faithful port of StudyKit.ensureTable + StudyKit.defaultColumns: builds the column
// set for one category from a representative study (defaults + dynamic parameters /
// conditions / interpretation columns), then applies the per-category config overrides.
//
// Effect-based columns (Endpoint/Result/Text/conditions) carry a `renderEffect(effect)`
// in addition to the whole-array `render`, so StudyTable can lay each effect out on its
// own table row (rowSpan on the per-study columns) — the aligned grid the legacy produced
// with nested tables + equalizeHeights.

const ERROR_DEFAULT = 'Err' // StudyKit.defaults.errorDefault

function shorten(uuid) {
  if (uuid == null) return ''
  const s = String(uuid)
  const short = s.length > 12 ? s.slice(0, 8) + '…' : s
  return '<span title="' + s + '" class="jtox-uuid">' + short + '</span>'
}

// Per-effect renderers (one effect → HTML string).
const endpointEffect = (d) => {
  let t = d?.endpoint ?? ''
  if (d?.endpointtype != null) t += ' (' + d.endpointtype + ')'
  return t
}
const resultEffect = (d) => {
  let r = renderRange(d?.result, null, 'display')
  if (d?.result?.errorValue != null) {
    r += ' (' + (d.result.errQualifier || ERROR_DEFAULT) + ' ' + d.result.errorValue + ')'
  }
  return r
}
const textEffect = (d) => d?.result?.textValue || '-'

// An effect-based column: renderEffect for the per-row layout + render (renderMulti) for
// filtering and any non-rowspan fallback.
function effectColumn(title, className, width, renderEffect) {
  return {
    title, className, width, data: 'effects', perEffect: true, renderEffect,
    render: (effects, type) => renderMulti(effects, (e) => renderEffect(e, type))
  }
}

// StudyKit.defaultColumns (indices referenced by putDefaults below).
const defaultColumns = [
  // 0 — main
  { title: 'Name', className: 'center middle', width: '15%', data: 'protocol.endpoint' },
  // 1,2,3 — effects
  effectColumn('Endpoint', 'center middle jtox-multi', '10%', endpointEffect),
  effectColumn('Result', 'center middle jtox-multi', '10%', resultEffect),
  effectColumn('Text', 'center middle jtox-multi', '10%', textEffect),
  // 4 — protocol: Guideline
  { title: 'Guideline', className: 'center middle', width: '15%', data: 'protocol.guideline', render: '[,]', defaultContent: '-' },
  // 5 — protocol: Owner
  { title: 'Owner', className: 'center middle', width: '10%', data: 'citation.owner', defaultContent: '-' },
  // 6 — protocol: Citation
  { title: 'Citation', className: 'center middle', width: '10%', data: 'citation', render: (d) => (d?.title || '') + ' ' + (!!d?.year || '') },
  // 7 — protocol: Reliability
  { title: 'Reliability', className: 'center middle', width: '10%', data: 'reliability', render: (d) => d?.r_value ?? '' },
  // 8 — protocol: UUID
  { title: 'UUID', className: 'center middle', width: '15%', data: 'uuid', searchable: false, render: (d, type) => (type !== 'display' ? '' + d : shorten(d)) }
]

// jQuery $.extend(true, …) equivalent — deep-merges objects and arrays (by index), used
// to build a "representative" study carrying every parameter / condition key.
function deepMerge(target, src) {
  for (const k in src) {
    const sv = src[k]
    if (Array.isArray(sv)) {
      if (!Array.isArray(target[k])) target[k] = []
      for (let i = 0; i < sv.length; i++) {
        if (sv[i] && typeof sv[i] === 'object') {
          if (!target[k][i] || typeof target[k][i] !== 'object') target[k][i] = Array.isArray(sv[i]) ? [] : {}
          deepMerge(target[k][i], sv[i])
        } else {
          target[k][i] = sv[i]
        }
      }
    } else if (sv && typeof sv === 'object') {
      if (!target[k] || typeof target[k] !== 'object' || Array.isArray(target[k])) target[k] = {}
      deepMerge(target[k], sv)
    } else {
      target[k] = sv
    }
  }
  return target
}

export function buildRepresentativeStudy(studies) {
  const rep = {}
  for (const s of studies) {
    deepMerge(rep, s)
    const hasParams = rep.parameters && Object.keys(rep.parameters).length > 0
    const cond = rep.effects && rep.effects[0] && rep.effects[0].conditions
    const hasConds = cond && Object.keys(cond).length > 0
    if (hasParams && hasConds) break
  }
  return rep
}

export function buildStudyColumns(study, category, columns) {
  const colDefs = []

  const putDefaults = (start, len, group) => {
    for (let i = 0; i < len; ++i) {
      const col = modifyColDef(columns, { ...defaultColumns[i + start] }, category, group)
      if (col != null) colDefs.push(col)
    }
  }

  // jT putAGroup: iterate a group's keys, skipping "<key> unit" companions, pushing the
  // column produced by fProcess (which may return null/undefined to skip).
  const putAGroup = (groupObj, fProcess) => {
    const skip = []
    for (const p in groupObj) {
      if (skip.indexOf(p) > -1) continue
      if (groupObj[p + ' unit'] !== undefined) skip.push(p + ' unit')
      const col = fProcess(p)
      if (col == null) continue
      colDefs.push(col)
    }
  }

  // 0 — main
  putDefaults(0, 1, 'main')

  const firstEffect = (study.effects && study.effects[0]) || {}
  const conditions = firstEffect.conditions || {}

  // parameters (per-study scalars; skip those that are really conditions)
  putAGroup(study.parameters || {}, (p) => {
    if (conditions[p] !== undefined || conditions[p + ' unit'] !== undefined) return undefined
    let col = { title: p, className: 'center middle', data: 'parameters.' + p, defaultContent: '-' }
    col = modifyColDef(columns, col, category, 'parameters')
    if (col == null) return null
    col.render = (data, type, full) => renderRange(data, full ? full[p + ' unit'] : undefined, type)
    return col
  })

  // conditions (per-effect)
  putAGroup(conditions, (c) => {
    let col = { title: c, className: 'center middle jtox-multi', data: 'effects' }
    col = modifyColDef(columns, col, category, 'conditions')
    if (col == null) return null
    const renderEffect = (d) => renderRange(d?.conditions?.[c], d?.conditions?.[c + ' unit'], 'display')
    col.perEffect = true
    col.renderEffect = renderEffect
    col.render = (data) => renderMulti(data, renderEffect)
    return col
  })

  // 1,2,3 — effects defaults
  putDefaults(1, 3, 'effects')

  // interpretation (per-study scalar)
  putAGroup(study.interpretation || {}, (i) => {
    const col = { title: i, className: 'center middle', data: 'interpretation.' + i, defaultContent: '-' }
    return modifyColDef(columns, col, category, 'interpretation')
  })

  // 4..8 — protocol defaults
  putDefaults(4, 5, 'protocol')

  return sortColDefs(colDefs)
}
