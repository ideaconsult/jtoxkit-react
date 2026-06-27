// AMBIT REST data source — the faithful port of jToxKit's `jT.ambit.call` sequence.
// Returns AMBIT-shaped objects (pass-through) so the column config + renderers stay
// valid if a different source (e.g. a future Solr adapter) is swapped in.

function authHeaders(token) {
  const h = { Accept: 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

export function createAmbitSource({ apiBase = '', token = null, credentials = 'include', rewrite = null } = {}) {
  const base = (apiBase || '').replace(/\/$/, '')

  // AMBIT URIs in responses are absolute; ids / relative paths resolve against apiBase.
  // `rewrite` (dev only) can route the final URL through a same-origin proxy to dodge CORS.
  const resolve = (uri) => {
    if (!uri) return ''
    const url = /^https?:\/\//i.test(uri) ? uri : base + '/' + String(uri).replace(/^\//, '')
    return rewrite ? rewrite(url) : url
  }

  async function getJson(uri, { signal } = {}) {
    const url = resolve(uri)
    const res = await fetch(url, { headers: authHeaders(token), credentials, signal })
    if (!res.ok) throw new Error(`AMBIT HTTP ${res.status} for ${url}`)
    return res.json()
  }

  return {
    resolve,
    getJson,

    // GET substance/{uuid} → first substance record (AMBIT shape)
    async getSubstance(uri, opts) {
      const json = await getJson(uri, opts)
      return json?.substance?.[0] ?? null
    },

    // GET {referenceSubstance.uri} → dataset (dataEntry[] + feature{}) for the structure card
    async getReferenceSubstance(uri, opts) {
      return getJson(uri, opts)
    },

    // GET {substance.URI}/studysummary → facet[] of {topcategory, category, count}
    async getStudySummary(uri, opts) {
      const json = await getJson(uri, opts)
      return json?.facet ?? []
    },

    // GET {topcategory.uri} → study[] (protocol/parameters/effects/interpretation/reliability)
    async getStudies(categoryUri, opts) {
      const json = await getJson(categoryUri, opts)
      return json?.study ?? []
    },

    // GET {substance.URI}/composition → { composition[], feature{} }
    async getComposition(uri, opts) {
      return getJson(uri, opts)
    }
  }
}
