import { useState, useCallback, useRef, useEffect } from 'react'
import { useDataSource } from '../context/DataSource'

// Generic single-call loader bound to one data-source method. Mirrors qubounds
// useSolr: a `load(uri)` callback + { data, loading, error } state, with the in-flight
// request aborted on a new call or unmount.
export function useAmbitCall(method) {
  const source = useDataSource()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const ctrlRef = useRef(null)

  const load = useCallback(async (uri) => {
    ctrlRef.current?.abort()
    if (!uri) { setData(null); setError(null); return }
    const ctrl = new AbortController()
    ctrlRef.current = ctrl
    setLoading(true); setError(null)
    try {
      const result = await source[method](uri, { signal: ctrl.signal })
      if (!ctrl.signal.aborted) setData(result)
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message || String(e))
    } finally {
      if (!ctrl.signal.aborted) setLoading(false)
    }
  }, [source, method])

  useEffect(() => () => ctrlRef.current?.abort(), [])
  return { load, data, loading, error, source }
}

export const useSubstance = () => useAmbitCall('getSubstance')
export const useReferenceSubstance = () => useAmbitCall('getReferenceSubstance')
export const useStudySummary = () => useAmbitCall('getStudySummary')
export const useStudies = () => useAmbitCall('getStudies')
export const useComposition = () => useAmbitCall('getComposition')
// load(substancesPayload) → ramanchada-api EffectArray JSON (dose-response conversion)
export const useEffectArrays = () => useAmbitCall('convertEffectArray')
