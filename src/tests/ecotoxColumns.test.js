import { describe, it, expect } from 'vitest'
import { config_study } from '../config/studyColumns.js'
import { buildStudyColumns, buildRepresentativeStudy } from '../utils/buildStudyColumns.js'
import { renderCellHtml } from '../components/DataCell.jsx'

// Real-shaped AMBIT ECOTOX study (captured from nanoreg1 NNRG-a51b2e58, EC_ALGAETOX_SECTION).
// Guards the regression where the built lib emptied the Reference (citation + experiment
// links via iuuid/auuid) and Protocol (guideline + MEDIUM.* params via $.each) columns
// because legacyGlobals was tree-shaken. Runs the real config render pipeline.
const study = {
  uuid: 'NNRG-ECT-0001',
  investigation_uuid: 'INV-ECT-1',
  assay_uuid: 'ASSAY-ECT-1',
  owner: { substance: { uuid: 'NNRG-a51b2e58' }, company: { uuid: 'NNRG-co', name: 'NANoREG' } },
  citation: { title: 'Psubcapitata_TiO2', year: '2016', owner: 'USP' },
  protocol: {
    topcategory: 'ECOTOX',
    category: { code: 'EC_ALGAETOX_SECTION', title: '6.1.5 Toxicity to aquatic algae and cyanobacteria' },
    endpoint: 'FRESHWATER TOXICITY',
    guideline: ['SOP-Toxicity Test with Microalgae P.subcapitata (without NOM)'],
  },
  parameters: {
    MEDIUM: 'Water 100%',
    'MEDIUM.TEMPERATURE': { loValue: 25.0, unit: 'Celsius' },
    DISPERSION_PROTOCOL: '20150429 NANoREG-Ecotox',
  },
  reliability: { r_value: '1 (reliable without restriction)' },
  effects: [
    {
      endpoint: 'L.L._(LOWER_LIMIT)',
      result: { unit: 'mg/l', loValue: 1.48 },
      conditions: { DOSE: { loValue: 3.5, unit: 'mg/l' }, 'E.ANIMAL_MODEL': 'Pseudokirchneriella subcapitata', TEST_TYPE: 'Acute Toxicity test' },
    },
  ],
}

function cellsByTitle(category) {
  const cols = buildStudyColumns(buildRepresentativeStudy([study]), category, config_study.columns)
  const out = {}
  for (const c of cols) out[c.title] = renderCellHtml(c, study)
  return { cols, out }
}

describe('EC_ALGAETOX_SECTION real-data columns', () => {
  it('builds the expected configured columns', () => {
    const { cols } = cellsByTitle('EC_ALGAETOX_SECTION')
    const titles = cols.map((c) => c.title)
    // the config renames/curates columns for this category (matches the live study page)
    expect(titles).toEqual(expect.arrayContaining(['Reference', 'Protocol']))
  })

  it('Reference column is populated (citation + experiment links)', () => {
    const { out } = cellsByTitle('EC_ALGAETOX_SECTION')
    const ref = out['Reference'] || ''
    expect(ref.trim().length).toBeGreaterThan(0)
    // citation owner/title and the iuuid/auuid-driven links must render
    expect(ref).toMatch(/USP|Psubcapitata|experiment/i)
  })

  it('Protocol column is populated (guideline + MEDIUM params via $.each)', () => {
    const { out } = cellsByTitle('EC_ALGAETOX_SECTION')
    const proto = out['Protocol'] || ''
    expect(proto.trim().length).toBeGreaterThan(0)
    expect(proto).toMatch(/SOP-Toxicity|MEDIUM|Microalgae/i)
  })
})
