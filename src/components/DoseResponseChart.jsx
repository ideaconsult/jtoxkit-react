import { useEffect, useMemo, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'
import {
  panelsForStudy,
  primaryDoseAxis,
  toPlotSeries,
  classifyControl,
  seriesLabel,
} from '../jsambit/index.js'

// Dose-response chart over pyambit-converted EffectArrays (jsambit studies). The hard
// grouping is already done server-side (pyambit split records by the non-numeric
// conditions), so each panel = one endpoint+unit and each array is a ready series:
//   * test (dosed) arrays  → dots + connecting line + mean±SD error bars
//   * control arrays       → a dashed horizontal reference line at the control mean,
//                            one per control type (positive / negative / interference…),
// all sharing a single `series` colour scale so the legend labels everything. Mirrors the
// spectrasearch Chart.jsx pattern: build Plot.plot(...) into a ref, remove() on cleanup.

// Build the displayable panels across a category's studies, each with a readable label.
function buildPanels(studies) {
  const out = []
  for (const study of studies || []) {
    for (const panel of panelsForStudy(study)) {
      const ep = panel.endpoint || '—'
      const et = panel.endpointtype ? ` (${panel.endpointtype})` : ''
      const yu = panel.yUnit ? ` [${panel.yUnit}]` : ''
      out.push({ ...panel, documentUuid: study.documentUuid, label: `${ep}${et}${yu}` })
    }
  }
  return out
}

// Turn one panel into marks-ready data for a given logX choice.
function panelData(panel, logX) {
  const points = [] // every point (test + control), coloured by series
  const lines = []  // test series only, for the connecting line
  const controlMeans = [] // { series, y } reference lines for controls
  for (const arr of panel.arrays) {
    const role = classifyControl(arr.conditions)
    const isCtl = role !== 'test'
    const series = isCtl ? `${role} control` : seriesLabel(arr)
    const pts = toPlotSeries(arr, { logX }).map((p) => ({ ...p, series, isControl: isCtl }))
    if (!pts.length) continue
    points.push(...pts)
    if (isCtl) {
      const mean = pts.reduce((s, p) => s + p.y, 0) / pts.length
      controlMeans.push({ series, y: mean })
    } else {
      lines.push(...pts)
    }
  }
  lines.sort((a, b) => a.x - b.x)
  const axis = primaryDoseAxis(panel.arrays[0]) || {}
  return {
    points,
    lines,
    controlMeans,
    errorPoints: points.filter((p) => p.ylo != null && p.yhi != null),
    xLabel: `Concentration${axis.unit ? ` (${axis.unit})` : ''}`,
    yLabel: `${panel.endpoint || 'response'}${panel.yUnit ? ` (${panel.yUnit})` : ''}`,
  }
}

export default function DoseResponseChart({ studies }) {
  const panels = useMemo(() => buildPanels(studies), [studies])
  const [logX, setLogX] = useState(true)
  const [sel, setSel] = useState(0)
  const ref = useRef(null)

  const panel = panels.length ? panels[Math.min(sel, panels.length - 1)] : null

  useEffect(() => {
    const host = ref.current
    if (!panel || !host) return
    const d = panelData(panel, logX)

    const marks = [
      Plot.ruleY([0], { stroke: '#ddd' }),
      // mean ± SD error bars (vertical) for every point that carries a spread
      Plot.ruleX(d.errorPoints, { x: 'x', y1: 'ylo', y2: 'yhi', stroke: 'series', strokeOpacity: 0.5 }),
      // connecting line for the dosed (test) series
      Plot.line(d.lines, { x: 'x', y: 'y', stroke: 'series' }),
      // every measured point
      Plot.dot(d.points, { x: 'x', y: 'y', stroke: 'series', fill: 'white', strokeWidth: 1.5, r: 3.5, tip: true }),
      // one dashed reference line per control type, at its mean
      Plot.ruleY(d.controlMeans, { y: 'y', stroke: 'series', strokeDasharray: '4 3', strokeOpacity: 0.8 }),
    ]

    const plot = Plot.plot({
      width: host.clientWidth || 640,
      height: 340,
      marginLeft: 56,
      marginBottom: 42,
      grid: true,
      color: { legend: true },
      x: { type: logX ? 'log' : 'linear', label: d.xLabel },
      y: { label: d.yLabel },
      marks,
    })
    host.append(plot)
    return () => plot.remove()
  }, [panel, logX])

  if (!panels.length) return <div className="jtox-empty">No dose-response data for this category.</div>

  return (
    <div className="jtox-doseresponse">
      <div className="jtox-dr-toolbar">
        {panels.length > 1 && (
          <select
            className="jtox-dr-select"
            value={Math.min(sel, panels.length - 1)}
            onChange={(e) => setSel(Number(e.target.value))}
          >
            {panels.map((p, i) => (
              <option key={p.key + i} value={i}>{p.label}</option>
            ))}
          </select>
        )}
        <label className="jtox-dr-logx">
          <input type="checkbox" checked={logX} onChange={(e) => setLogX(e.target.checked)} /> log X
        </label>
      </div>
      <div className="jtox-dr-plot" ref={ref} />
    </div>
  )
}
