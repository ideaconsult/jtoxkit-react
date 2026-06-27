import '../utils/legacyGlobals.js'
import { describe, it, expect } from 'vitest'
import { renderCellHtml } from '../components/DataCell.jsx'
import { config_bao } from '../config/bao.js'

// Regression: the bundled config render() callbacks were classic non-strict scripts that
// use jQuery `$.each` and implicit globals (iuuid/auuid). The legacyGlobals shim must let
// them run, and renderCellHtml must degrade gracefully if one still throws.
describe('legacy config render via the shim', () => {
  it('runs the bao guideline render ($.each over parameters) without throwing', () => {
    const col = { ...config_bao.protocol.guideline, data: 'protocol.guideline' }
    const row = {
      protocol: { guideline: ['OECD 109'] },
      parameters: { Type: 'powder', D50: '1 nm' },
      owner: { substance: { uuid: 'S1' } },
      investigation_uuid: 'I1',
      assay_uuid: 'A1'
    }
    const html = renderCellHtml(col, row)
    expect(typeof html).toBe('string')
    expect(html).toContain('OECD 109')
  })

  it('falls back to the raw value when a render() throws', () => {
    const col = { title: 'X', data: 'a', render: () => { throw new Error('boom') }, defaultContent: '-' }
    expect(renderCellHtml(col, { a: 'raw' })).toBe('raw')
  })
})
