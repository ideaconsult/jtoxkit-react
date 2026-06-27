import { useEffect, useMemo, useState } from 'react'
import { useStudies } from '../hooks/useAmbit.js'
import { useViewerConfig } from '../context/ViewerConfig.jsx'
import { config_study } from '../config/studyColumns.js'
import StudyTable from './StudyTable.jsx'

const KNOWN = { 'P-CHEM': 'P-Chem', ENV_FATE: 'Env Fate', ECOTOX: 'Eco Tox', TOX: 'Tox' }

// Build the top-category tabs from the studysummary facet. Each tab fetches one
// topcategory.uri (all studies under it) and groups them by protocol.category.code.
function buildTabs(summary) {
  const byTop = new Map()
  for (const f of summary || []) {
    const top = f.topcategory
    if (!top?.title) continue
    const key = top.title
    let tab = byTop.get(key)
    if (!tab) {
      tab = { key, label: KNOWN[key] || top.title, uri: top.uri, total: 0 }
      byTop.set(key, tab)
    }
    if (!tab.uri && top.uri) tab.uri = top.uri
    tab.total += f.count || 0
  }
  return [...byTop.values()]
}

function groupByCategory(studies) {
  const groups = {}
  for (const s of studies || []) {
    const cat = s.protocol?.category || {}
    const code = cat.code || 'UNKNOWN'
    if (!groups[code]) groups[code] = { code, title: cat.title || code, studies: [] }
    groups[code].studies.push(s)
  }
  return Object.values(groups)
}

function FoldableCategory({ title, collapsed, onToggle, children }) {
  return (
    <div className={'jtox-foldable' + (collapsed ? ' folded' : '')}>
      <button type="button" className="jtox-foldable-head" onClick={onToggle}>
        <span className="jtox-foldable-caret">{collapsed ? '▸' : '▾'}</span>
        <span className="jtox-foldable-title">{title}</span>
      </button>
      {!collapsed && <div className="jtox-foldable-body">{children}</div>}
    </div>
  )
}

function StudyTab({ tab, cached, onLoaded }) {
  const cfg = useViewerConfig()
  const columns = (cfg.columnConfig || config_study).columns
  const { load, data, loading, error } = useStudies()
  const studies = cached ?? data

  const [filter, setFilter] = useState('')
  const [collapsed, setCollapsed] = useState(() => new Set())

  useEffect(() => {
    if (!cached) load(tab.uri)
  }, [tab.uri, cached, load])

  useEffect(() => {
    if (!cached && data) onLoaded(tab.key, data)
  }, [data, cached, tab.key, onLoaded])

  const groups = useMemo(() => groupByCategory(studies), [studies])

  if (loading && !studies) return <div className="jtox-loading">Loading studies…</div>
  if (error) return <div className="jtox-error">Error loading studies: {error}</div>
  if (!studies?.length) return <div className="jtox-empty">No studies in this category.</div>

  const allCollapsed = collapsed.size >= groups.length && groups.length > 0
  const toggleAll = () => setCollapsed(allCollapsed ? new Set() : new Set(groups.map((g) => g.code)))
  const toggleOne = (code) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(code) ? next.delete(code) : next.add(code)
      return next
    })

  return (
    <div className="jtox-tab-content">
      <div className="jtox-tab-toolbar">
        <input
          className="jtox-filter"
          type="search"
          placeholder="Filter studies…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button type="button" className="jtox-link-btn" onClick={toggleAll}>
          {allCollapsed ? 'Expand all' : 'Collapse all'}
        </button>
      </div>
      {groups.map((g) => (
        <FoldableCategory
          key={g.code}
          title={`${g.title} (${g.studies.length})`}
          collapsed={collapsed.has(g.code)}
          onToggle={() => toggleOne(g.code)}
        >
          <StudyTable studies={g.studies} category={g.code} columns={columns} filter={filter} />
        </FoldableCategory>
      ))}
    </div>
  )
}

export default function StudyViewer({ summary, initialTab }) {
  const tabs = useMemo(() => buildTabs(summary), [summary])
  const [active, setActive] = useState(0)
  const [cache, setCache] = useState({})

  useEffect(() => {
    if (!initialTab) {
      setActive(0)
      return
    }
    const want = String(initialTab).replace(/ /g, '_').toUpperCase()
    const idx = tabs.findIndex((t) => t.key.replace(/ /g, '_').toUpperCase() === want)
    setActive(idx >= 0 ? idx : 0)
  }, [tabs, initialTab])

  const onLoaded = useMemo(
    () => (key, studies) => setCache((c) => (c[key] ? c : { ...c, [key]: studies })),
    []
  )

  if (!tabs.length) return null
  const tab = tabs[Math.min(active, tabs.length - 1)]

  return (
    <div className="jtox-section">
      <h3 className="jtox-section-title">Studies</h3>
      <div className="jtox-tabs" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={'jtox-tab' + (i === active ? ' active' : '')}
            onClick={() => setActive(i)}
          >
            {t.label} <span className="jtox-count">{t.total}</span>
          </button>
        ))}
      </div>
      <StudyTab key={tab.key} tab={tab} cached={cache[tab.key]} onLoaded={onLoaded} />
    </div>
  )
}
