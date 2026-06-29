import { useEffect, useMemo, useState } from 'react'
import { useEffectArrays } from '../hooks/useAmbit.js'
import { useDataSource } from '../context/DataSource.jsx'
import StudyTable from './StudyTable.jsx'
import DoseResponseChart from './DoseResponseChart.jsx'
import { ambitHasConcentration, parseConversion, toLongRows, toCsv } from '../jsambit/index.js'

const AUTO_CHART_EFFECT_ROWS = 50 // above this, a dose-response category opens as a chart

const effectRowCount = (studies) =>
  (studies || []).reduce((n, s) => n + (Array.isArray(s.effects) ? s.effects.length : 1), 0)

function download(name, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

// One category's studies, with an optional Table | Dose-response toggle. The toggle
// appears only when the category looks like dose-response AND the host configured a
// ramanchada-api convert base. In chart mode the studies are converted to plottable
// EffectArrays (pyambit) once and cached for this section.
export default function CategorySection({ group, columns, filter, substance }) {
  const source = useDataSource()
  const canConvert = !!source?.canConvert
  const detectable = useMemo(() => ambitHasConcentration(group.studies), [group.studies])
  const offerChart = canConvert && detectable

  const [mode, setMode] = useState(() =>
    offerChart && effectRowCount(group.studies) > AUTO_CHART_EFFECT_ROWS ? 'chart' : 'table'
  )

  const { load, data, loading, error } = useEffectArrays()

  // Wrap the category's studies as an AMBIT Substances payload for the converter.
  const payload = useMemo(
    () => ({
      substance: [
        {
          name: substance?.publicname || substance?.name || 'substance',
          i5uuid: substance?.i5uuid,
          study: group.studies,
        },
      ],
    }),
    [group.studies, substance]
  )

  // Convert lazily when the chart is first shown.
  useEffect(() => {
    if (mode === 'chart' && offerChart && !data && !loading && !error) load(payload)
  }, [mode, offerChart, data, loading, error, load, payload])

  const parsed = useMemo(() => (data ? parseConversion(data) : null), [data])

  const exportCsv = () => {
    if (!parsed) return
    download(`${group.code || 'studies'}_doseresponse.csv`, toCsv(toLongRows(parsed)), 'text/csv')
  }

  return (
    <div className="jtox-category-section">
      {offerChart && (
        <div className="jtox-view-toggle">
          <button
            type="button"
            className={'jtox-view-btn' + (mode === 'table' ? ' active' : '')}
            onClick={() => setMode('table')}
          >
            Table
          </button>
          <button
            type="button"
            className={'jtox-view-btn' + (mode === 'chart' ? ' active' : '')}
            onClick={() => setMode('chart')}
          >
            Dose–response
          </button>
          {mode === 'chart' && parsed && (
            <button type="button" className="jtox-link-btn jtox-dr-export" onClick={exportCsv}>
              Export CSV
            </button>
          )}
        </div>
      )}

      {mode === 'chart' && offerChart ? (
        loading ? (
          <div className="jtox-loading">Converting dose-response…</div>
        ) : error ? (
          <div className="jtox-error">Could not build chart: {error}</div>
        ) : (
          <DoseResponseChart studies={parsed || []} />
        )
      ) : (
        <StudyTable studies={group.studies} category={group.code} columns={columns} filter={filter} />
      )}
    </div>
  )
}
