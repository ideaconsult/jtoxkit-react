import { describe, it, expect, vi, afterEach } from 'vitest'
import { createAmbitSource } from '../data/ambitSource.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockFetch(json, ok = true, status = 200) {
  const fetch = vi.fn(async () => ({ ok, status, json: async () => json }))
  vi.stubGlobal('fetch', fetch)
  return fetch
}

describe('createAmbitSource.resolve', () => {
  const src = createAmbitSource({ apiBase: 'https://x/nano/' })
  it('resolves relative ids against the base and passes absolute URLs through', () => {
    expect(src.resolve('substance/1')).toBe('https://x/nano/substance/1')
    expect(src.resolve('/substance/1')).toBe('https://x/nano/substance/1')
    expect(src.resolve('https://abs/y')).toBe('https://abs/y')
  })
})

describe('createAmbitSource fetchers', () => {
  it('getSubstance returns the first substance record', async () => {
    const fetch = mockFetch({ substance: [{ URI: 'u', name: 'NM-101' }] })
    const src = createAmbitSource({ apiBase: 'https://x/nano' })
    const sub = await src.getSubstance('substance/1')
    expect(sub).toEqual({ URI: 'u', name: 'NM-101' })
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('getStudySummary returns the facet array', async () => {
    mockFetch({ facet: [{ topcategory: { title: 'TOX' } }] })
    const src = createAmbitSource({ apiBase: 'https://x/nano' })
    const facet = await src.getStudySummary('substance/1/studysummary')
    expect(facet).toHaveLength(1)
  })

  it('throws on a non-ok response', async () => {
    mockFetch({}, false, 404)
    const src = createAmbitSource({ apiBase: 'https://x/nano' })
    await expect(src.getStudies('cat')).rejects.toThrow('404')
  })
})
