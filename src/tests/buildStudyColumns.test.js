import { describe, it, expect } from 'vitest'
import { buildStudyColumns, buildRepresentativeStudy } from '../utils/buildStudyColumns.js'
import { config_study } from '../config/studyColumns.js'

const sampleStudy = {
  uuid: 'abcd1234efgh5678',
  protocol: { endpoint: 'Density', category: { code: 'PC_DENSITY_SECTION', title: 'Density' }, guideline: ['OECD 109'] },
  parameters: { Type: 'powder' },
  effects: [
    {
      endpoint: 'density',
      result: { loValue: 1.2, unit: 'g/cm3' },
      conditions: { Temperature: 25, 'Temperature unit': 'C' }
    }
  ],
  interpretation: {},
  reliability: { r_value: '1 (reliable)' },
  citation: { owner: 'Acme', title: 'Study', year: 2020 }
}

describe('buildStudyColumns (no overrides)', () => {
  const cols = buildStudyColumns(sampleStudy, 'PC_DENSITY_SECTION', {})
  const titles = cols.map((c) => c.title)

  it('builds defaults + dynamic parameter/condition columns', () => {
    expect(titles).toEqual(
      expect.arrayContaining(['Name', 'Type', 'Temperature', 'Endpoint', 'Result', 'Text', 'Guideline', 'Owner', 'Reliability', 'UUID'])
    )
  })

  it('does not emit a separate "<key> unit" column', () => {
    expect(titles).not.toContain('Temperature unit')
  })

  it('renders the Result cell as a value with units', () => {
    const result = cols.find((c) => c.title === 'Result')
    const html = result.render(sampleStudy.effects, 'display', sampleStudy)
    expect(html).toContain('1.2')
    expect(html).toContain('g/cm3')
  })

  it('renders a condition cell from the effect conditions', () => {
    const temp = cols.find((c) => c.title === 'Temperature')
    const html = temp.render(sampleStudy.effects, 'display', sampleStudy)
    expect(html).toContain('25')
  })

  it('renders the Guideline [,] join shorthand value', () => {
    const g = cols.find((c) => c.title === 'Guideline')
    expect(g.render).toBe('[,]')
  })
})

describe('buildStudyColumns (with bundled config_study)', () => {
  it('honors config_study hiding the main Name column', () => {
    const cols = buildStudyColumns(sampleStudy, 'PC_DENSITY_SECTION', config_study.columns)
    // config_study._.main.name.visible === false
    expect(cols.find((c) => c.title === 'Name')).toBeUndefined()
  })
})

describe('buildRepresentativeStudy', () => {
  it('merges studies until parameters and conditions are populated', () => {
    const rep = buildRepresentativeStudy([
      { parameters: { A: 1 }, effects: [{ conditions: {} }] },
      { parameters: { A: 1, B: 2 }, effects: [{ conditions: { T: 5 } }] }
    ])
    expect(rep.parameters).toEqual({ A: 1, B: 2 })
    expect(rep.effects[0].conditions).toEqual({ T: 5 })
  })
})
