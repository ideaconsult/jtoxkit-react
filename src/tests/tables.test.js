import { describe, it, expect } from 'vitest'
import {
  normalizeColDef,
  modifyColDef,
  sortColDefs,
  renderMulti,
  getPath,
  renderStringShorthand
} from '../utils/tables.js'

describe('normalizeColDef', () => {
  it('maps legacy Hungarian keys to modern names', () => {
    expect(normalizeColDef({ sTitle: 'X', bVisible: false, iOrder: -2 })).toEqual({
      title: 'X',
      visible: false,
      order: -2
    })
  })
})

describe('modifyColDef', () => {
  const columns = {
    _: { effects: { result: { sTitle: 'Outcome' } } },
    FOO: { effects: { result: { bVisible: false } } }
  }

  it('applies the _ default override (and legacy sTitle) to a base column', () => {
    const col = modifyColDef(columns, { title: 'Result', data: 'effects' }, 'BAR', 'effects')
    expect(col.title).toBe('Outcome')
    expect(col.data).toBe('effects')
  })

  it('drops a column the category override marks invisible', () => {
    const col = modifyColDef(columns, { title: 'Result', data: 'effects' }, 'FOO', 'effects')
    expect(col).toBeNull()
  })

  it('returns the base column untouched when no override matches', () => {
    const col = modifyColDef({}, { title: 'Name', data: 'protocol.endpoint' }, 'X', 'main')
    expect(col.title).toBe('Name')
  })
})

describe('sortColDefs', () => {
  it('sorts by order then insertion order', () => {
    const sorted = sortColDefs([{ title: 'a' }, { title: 'b', order: -1 }, { title: 'c' }])
    expect(sorted.map((c) => c.title)).toEqual(['b', 'a', 'c'])
  })
})

describe('renderMulti', () => {
  it('renders a single item directly', () => {
    expect(renderMulti([{ v: 1 }], (d) => `x${d.v}`)).toBe('x1')
  })
  it('stacks multiple items in a jtox-multi wrapper', () => {
    const out = renderMulti([{ v: 1 }, { v: 2 }], (d) => `x${d.v}`)
    expect(out).toContain('class="jtox-multi"')
    expect(out).toContain('x1')
    expect(out).toContain('x2')
  })
})

describe('getPath / renderStringShorthand', () => {
  it('reads nested paths with a fallback', () => {
    expect(getPath({ a: { b: 2 } }, 'a.b')).toBe(2)
    expect(getPath({}, 'a.b', '-')).toBe('-')
  })
  it('interprets the [sep] join shorthand and property access', () => {
    expect(renderStringShorthand(['a', 'b'], '[,]')).toBe('a,b')
    expect(renderStringShorthand({ x: 'y' }, 'x')).toBe('y')
  })
})
