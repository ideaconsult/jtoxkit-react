import '../utils/legacyGlobals.js'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import StudyTable from '../components/StudyTable.jsx'
import { groupWithStudy, countStudies } from '../utils/focusScope.js'
import { config_study } from '../config/studyColumns.js'

afterEach(cleanup)

// A study is one protocol application: its AMBIT `uuid` is the document_uuid a host
// passes as `documentUuid`, arriving here as `focusUuid`.
const makeStudy = (n, code = 'EC_CYTOTOX') => ({
  uuid: `doc-${n}`,
  owner: { substance: { uuid: 'S1' } },
  protocol: {
    topcategory: 'TOX',
    category: { code, title: code },
    endpoint: 'Cytotoxicity',
    guideline: ['SOP']
  },
  citation: { title: 'ref', year: '2023', owner: 'RIVM' },
  parameters: {},
  effects: [{ endpoint: 'Viability', result: { loValue: n, unit: '%' }, conditions: {} }]
})

const studies = Array.from({ length: 3 }, (_, i) => makeStudy(i + 1))

function renderTable(focusUuid, filter = '') {
  return render(
    <StudyTable
      studies={studies}
      category="EC_CYTOTOX"
      columns={config_study.columns}
      filter={filter}
      focusUuid={focusUuid}
    />
  )
}

describe('StudyTable focusUuid', () => {
  it('shows every study when none is focused', () => {
    const { container } = renderTable(undefined)
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
  })

  it('narrows to just the focused study', () => {
    const { container } = renderTable('doc-2')
    expect(container.querySelectorAll('tbody tr')).toHaveLength(1)
  })

  it('bypasses the text filter while scoped, so the linked study is never hidden', () => {
    const { container } = renderTable('doc-2', 'text that matches nothing')
    expect(container.querySelectorAll('tbody tr')).toHaveLength(1)
    expect(screen.queryByText(/No studies match/)).not.toBeInTheDocument()
  })

  it('leaves the list alone when the focused study is in another category', () => {
    const { container } = renderTable('doc-from-another-category')
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
  })
})

// The tab-level half of the scope: a deep link narrows the topcategory to the ONE category
// group holding that study. Scoping only within a group would leave every other category
// on screen -- for NANoREG's NM-101, P-CHEM's other categories run to 131+ studies, which
// is why the study looked like it did nothing.
describe('groupWithStudy', () => {
  const groups = [
    { code: 'PC_GRANULOMETRY_SECTION', studies: [makeStudy(10), makeStudy(11)] },
    { code: 'CRYSTALLINE_PHASE_SECTION', studies: [makeStudy(20), makeStudy(21)] }
  ]

  it('finds the group holding the study', () => {
    expect(groupWithStudy(groups, 'doc-21').code).toBe('CRYSTALLINE_PHASE_SECTION')
    expect(groupWithStudy(groups, 'doc-10').code).toBe('PC_GRANULOMETRY_SECTION')
  })

  it('returns null for an unknown study, or no focus at all', () => {
    expect(groupWithStudy(groups, 'doc-nope')).toBeNull()
    expect(groupWithStudy(groups, undefined)).toBeNull()
    expect(groupWithStudy([], 'doc-10')).toBeNull()
  })

  it('counts the studies the "Show all" way out would restore', () => {
    expect(countStudies(groups)).toBe(4)
    expect(countStudies([])).toBe(0)
  })
})
