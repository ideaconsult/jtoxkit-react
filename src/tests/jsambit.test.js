import { describe, it, expect } from 'vitest'
import {
  parseConversion,
  primaryDoseAxis,
  classifyControl,
  isControl,
  toPlotSeries,
  panelsForStudy,
  isDoseResponse,
  toLongRows,
  ambitStudiesToLongRows,
  toCsv,
} from '../jsambit/index.js'

// Mirrors the real ramanchada-api `POST /dataset/convert?format=effectarray` output
// (captured from pyambit convert_effectrecords2array): one study split into 3 arrays by
// the Treatment condition — an exposure dose curve + a positive and a negative control.
const apiResponse = {
  datasets: [
    {
      document_uuid: 'NNRG-doc-1',
      substance: { i5uuid: 'NNRG-s1', name: 'Ag 20 nm', publicname: 'Ag @ test' },
      protocol: { endpoint: 'Cell viability' },
      citation: { owner: 'LAB' },
      error: null,
      arrays: [
        {
          endpoint: 'viability', endpointtype: null,
          conditions: { Treatment: 'exposure' },
          signal: { unit: '%', values: [98, 80, 55, 20], errQualifier: 'SD', errorValue: [2, 3, 4, 5] },
          axes: { CONCENTRATION: { unit: 'ug/mL', values: [0.1, 1, 10, 100] } },
          axis_groups: null,
        },
        {
          endpoint: 'viability', endpointtype: null,
          conditions: { Treatment: 'positive control' },
          signal: { unit: '%', values: [8], errQualifier: 'SD', errorValue: [2] },
          axes: { CONCENTRATION: { unit: 'ug/mL', values: [100] } },
          axis_groups: null,
        },
        {
          endpoint: 'viability', endpointtype: null,
          conditions: { Treatment: 'negative control' },
          signal: { unit: '%', values: [100], errQualifier: 'SD', errorValue: [1] },
          axes: { CONCENTRATION: { unit: 'ug/mL', values: [0] } },
          axis_groups: null,
        },
      ],
    },
  ],
}

describe('parseConversion', () => {
  it('normalizes datasets + arrays', () => {
    const studies = parseConversion(apiResponse)
    expect(studies).toHaveLength(1)
    expect(studies[0].documentUuid).toBe('NNRG-doc-1')
    expect(studies[0].arrays).toHaveLength(3)
    expect(studies[0].arrays[0].signal.values).toEqual([98, 80, 55, 20])
  })
  it('accepts a bare array of studies too', () => {
    expect(parseConversion(apiResponse.datasets)).toHaveLength(1)
  })
})

describe('primaryDoseAxis', () => {
  it('finds the CONCENTRATION axis', () => {
    const [study] = parseConversion(apiResponse)
    const axis = primaryDoseAxis(study.arrays[0])
    expect(axis.name).toBe('CONCENTRATION')
    expect(axis.unit).toBe('ug/mL')
    expect(axis.values).toEqual([0.1, 1, 10, 100])
  })
  it('honors axis_groups primary key', () => {
    const arr = {
      axes: { CONCENTRATION_MASS: { unit: 'ug/mL', values: [1] }, CONCENTRATION: { unit: 'uM', values: [2] } },
      axisGroups: { CONCENTRATION: ['CONCENTRATION_MASS'] },
    }
    expect(primaryDoseAxis(arr).name).toBe('CONCENTRATION')
  })
})

describe('classifyControl', () => {
  it('reads the Treatment designation', () => {
    expect(classifyControl({ Treatment: 'positive control' })).toBe('positive')
    expect(classifyControl({ Treatment: 'negative control' })).toBe('negative')
    expect(classifyControl({ Treatment: 'interference control' })).toBe('interference')
    expect(classifyControl({ Treatment: 'vehicle' })).toBe('vehicle')
    expect(classifyControl({ Treatment: 'exposure' })).toBe('test')
    expect(classifyControl({})).toBe('test')
  })
  it('isControl is true for any non-test role', () => {
    expect(isControl({ Treatment: 'positive control' })).toBe(true)
    expect(isControl({ Treatment: 'exposure' })).toBe(false)
  })
})

describe('toPlotSeries', () => {
  it('builds points with error bars and control role', () => {
    const [study] = parseConversion(apiResponse)
    const pts = toPlotSeries(study.arrays[0])
    expect(pts).toHaveLength(4)
    expect(pts[0]).toMatchObject({ x: 0.1, y: 98, ylo: 96, yhi: 100, controlRole: 'test', errQualifier: 'SD' })
  })
  it('drops non-positive x under logX (control at dose 0)', () => {
    const [study] = parseConversion(apiResponse)
    const neg = study.arrays[2] // negative control at concentration 0
    expect(toPlotSeries(neg, { logX: false })).toHaveLength(1)
    expect(toPlotSeries(neg, { logX: true })).toHaveLength(0)
  })
})

describe('panelsForStudy', () => {
  it('groups arrays by endpoint+units into one panel (same endpoint/units here)', () => {
    const [study] = parseConversion(apiResponse)
    const panels = panelsForStudy(study)
    expect(panels).toHaveLength(1)
    expect(panels[0].arrays).toHaveLength(3)
    expect(panels[0].yUnit).toBe('%')
    expect(panels[0].xUnit).toBe('ug/mL')
  })
})

describe('isDoseResponse', () => {
  it('true when a dose axis + numeric points exist', () => {
    const [study] = parseConversion(apiResponse)
    expect(isDoseResponse(study)).toBe(true)
  })
  it('false for a study with no axes', () => {
    expect(isDoseResponse({ arrays: [{ endpoint: 'x', conditions: {}, signal: { values: [1] }, axes: {} }] })).toBe(false)
  })
})

describe('export', () => {
  it('toLongRows flattens every point', () => {
    const studies = parseConversion(apiResponse)
    const rows = toLongRows(studies)
    expect(rows).toHaveLength(6) // 4 + 1 + 1
    expect(rows[0]).toMatchObject({
      document_uuid: 'NNRG-doc-1', endpoint: 'viability', control_role: 'test',
      dose: 0.1, dose_unit: 'ug/mL', response: 98, response_unit: '%', error: 2, error_qualifier: 'SD',
    })
  })
  it('toCsv emits a header + one line per row', () => {
    const csv = toCsv(toLongRows(parseConversion(apiResponse)))
    const lines = csv.split('\n')
    expect(lines[0]).toContain('document_uuid')
    expect(lines).toHaveLength(7) // header + 6 rows
  })
})

// Raw AMBIT study (full shape) → the self-contained export used by the chart's CSV button.
const rawStudy = {
  uuid: 'NNRG-doc-1',
  investigation_uuid: 'INV-1',
  assay_uuid: 'ASSAY-1',
  protocol: {
    topcategory: 'TOX',
    category: { code: 'CELL_VIABILITY_ASSAY_SECTION', title: 'Cell viability' },
    endpoint: 'Cell viability',
    guideline: ['H2DCFDA-Probe'],
  },
  citation: { owner: 'INERIS', title: 'INERIS-ALI-NM101', year: '2016' },
  reliability: { r_value: '1 (reliable)' },
  parameters: { ASSAY: 'AlamarBlue', 'Cell type': 'A549' },
  effects: [
    {
      endpoint: 'viability',
      endpointtype: null,
      result: { loValue: 98, unit: '%', errorValue: 2, errQualifier: 'SD' },
      conditions: {
        Treatment: 'sample',
        'Exposure time': '3 h',
        CONCENTRATION: { loValue: 10, unit: 'ug/mL' },
      },
    },
  ],
}

describe('ambitStudiesToLongRows (full export)', () => {
  it('keeps all provenance: protocol, provider, params, conditions, result', () => {
    const rows = ambitStudiesToLongRows([rawStudy])
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      document_uuid: 'NNRG-doc-1',
      investigation_uuid: 'INV-1',
      assay_uuid: 'ASSAY-1',
      category: 'Cell viability',
      protocol_endpoint: 'Cell viability',
      guideline: 'H2DCFDA-Probe',
      provider: 'INERIS',
      reference: 'INERIS-ALI-NM101',
      reference_year: '2016',
      reliability: '1 (reliable)',
      'param.ASSAY': 'AlamarBlue',
      'param.Cell type': 'A549',
      effect_endpoint: 'viability',
      result_loValue: 98,
      result_unit: '%',
      error: 2,
      error_qualifier: 'SD',
      'cond.Treatment': 'sample', // real treatment value, not the classifier's "test"
      'cond.Exposure time': '3 h',
      'cond.CONCENTRATION': '10 ug/mL', // object value rendered with unit
    })
  })

  it('toCsv unions keys across rows with different conditions/params', () => {
    const other = { ...rawStudy, uuid: 'NNRG-doc-2', parameters: { Medium: 'water' }, effects: [
      { endpoint: 'x', result: { loValue: 1 }, conditions: { Donor: 'D1' } },
    ] }
    const csv = toCsv(ambitStudiesToLongRows([rawStudy, other]))
    const header = csv.split('\n')[0]
    expect(header).toContain('param.ASSAY')
    expect(header).toContain('param.Medium')
    expect(header).toContain('cond.Donor')
  })
})
