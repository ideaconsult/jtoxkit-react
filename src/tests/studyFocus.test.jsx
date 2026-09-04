import '../utils/legacyGlobals.js'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import StudyTable from '../components/StudyTable.jsx'
import { config_study } from '../config/studyColumns.js'

afterEach(cleanup)

// A study is one protocol application: its AMBIT `uuid` is the document_uuid a host
// passes as `documentUuid`. 25 of them so the target lands past the first page of 20.
const makeStudy = (n) => ({
  uuid: `doc-${n}`,
  owner: { substance: { uuid: 'S1' } },
  protocol: {
    topcategory: 'TOX',
    category: { code: 'EC_CYTOTOX', title: 'Cytotoxicity' },
    endpoint: 'Cytotoxicity',
    guideline: ['SOP']
  },
  citation: { title: 'ref', year: '2023', owner: 'RIVM' },
  parameters: {},
  effects: [{ endpoint: 'Viability', result: { loValue: n, unit: '%' }, conditions: {} }]
})

const studies = Array.from({ length: 25 }, (_, i) => makeStudy(i + 1))

function renderTable(focusUuid) {
  return render(
    <StudyTable
      studies={studies}
      category="EC_CYTOTOX"
      columns={config_study.columns}
      filter=""
      focusUuid={focusUuid}
    />
  )
}

describe('StudyTable focusUuid', () => {
  it('shows the first page and marks nothing when no study is focused', () => {
    const { container } = renderTable(undefined)
    expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument()
    expect(container.querySelector('tr.jtox-row-focus')).toBeNull()
  })

  it('pages to the focused study and marks its row', () => {
    // doc-23 is index 22 -> page 2 of 2 (PAGE_SIZE 20).
    const { container } = renderTable('doc-23')
    expect(screen.getByText(/2 \/ 2/)).toBeInTheDocument()
    expect(container.querySelectorAll('tr.jtox-row-focus')).toHaveLength(1)
  })

  it('leaves the page alone when the focused study is not in this category', () => {
    const { container } = renderTable('doc-from-another-category')
    expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument()
    expect(container.querySelector('tr.jtox-row-focus')).toBeNull()
  })
})
