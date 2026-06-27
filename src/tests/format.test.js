import { describe, it, expect } from 'vitest'
import { nicifyNumber, formatUnits, valueAndUnits, renderRange } from '../utils/format.js'

describe('nicifyNumber', () => {
  it('rounds to the shortest faithful precision', () => {
    expect(nicifyNumber(5)).toBe(5)
    expect(nicifyNumber(1.2000001)).toBeCloseTo(1.2, 5)
    expect(nicifyNumber(null)).toBe('')
  })
})

describe('formatUnits', () => {
  it('maps the micro prefix and exponents', () => {
    expect(formatUnits('um')).toBe('&#x00B5;m')
    expect(formatUnits('m^3')).toBe('m<sup>3</sup>')
    expect(formatUnits('')).toBe('')
  })
})

describe('valueAndUnits', () => {
  it('concatenates a nicified value with formatted units', () => {
    expect(valueAndUnits(5, 'mg/L')).toBe('5mg/L')
    expect(valueAndUnits(2, 'um')).toBe('2&#x00B5;m')
  })
})

describe('renderRange', () => {
  it('renders a scalar with units in display mode', () => {
    expect(renderRange(5, 'mg/L', 'display')).toBe('5mg/L')
  })

  it('renders a bracketed interval with a units span', () => {
    const out = renderRange(
      { loValue: 1, upValue: 10, loQualifier: '>=', upQualifier: '<=', unit: 'mg' },
      null,
      'display'
    )
    expect(out).toContain('[1,&nbsp;10]')
    expect(out).toContain('<span class="units">mg</span>')
  })

  it('renders a single qualified value', () => {
    const out = renderRange({ loValue: 5, loQualifier: '=', unit: 'mg' }, null, 'display')
    expect(out).toContain('5')
    expect(out).toContain('units">mg')
  })

  it('falls back to a dash for empty objects', () => {
    expect(renderRange(null, null, 'display')).toBe('-')
  })
})
