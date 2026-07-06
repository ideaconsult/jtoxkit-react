import { createContext, useContext, useEffect, useState } from 'react'

// Token is passed in — never acquired here.
// Priority: 1) URL param ?token=  2) sessionStorage  3) postMessage from parent frame
// If no token: the viewer still works for public AMBIT resources; protected resources
// degrade gracefully. AMBIT also accepts cookie credentials (withCredentials), handled
// in the data source.

const AuthContext = createContext(null)
const STORAGE_KEY = 'jtoxkit_token'

function readToken() {
  // 1. URL param (deep-link pattern for standalone viewers)
  const params = new URLSearchParams(window.location.search)
  const urlToken = params.get('token')
  if (urlToken) {
    sessionStorage.setItem(STORAGE_KEY, urlToken)
    params.delete('token')
    const newUrl = [window.location.pathname, params.toString()].filter(Boolean).join('?')
    window.history.replaceState(null, '', newUrl)
    return urlToken
  }
  // 2. Cached in sessionStorage from previous navigation
  return sessionStorage.getItem(STORAGE_KEY) || null
}

// `token` prop: when provided (embedded as a component, the host owns auth) it is used
// directly and URL/sessionStorage/postMessage acquisition is skipped. When omitted
// (standalone app) the token is read from the URL/sessionStorage and kept in sync via
// postMessage.
export function AuthProvider({ token: tokenProp, children }) {
  const controlled = tokenProp !== undefined
  const [token, setToken] = useState(() => (controlled ? tokenProp : readToken()))

  useEffect(() => {
    if (controlled) {
      setToken(tokenProp)
      return
    }
    const handler = (event) => {
      if (event.data?.type === 'keycloak_token' && event.data?.token) {
        sessionStorage.setItem(STORAGE_KEY, event.data.token)
        setToken(event.data.token)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [controlled, tokenProp])

  return (
    <AuthContext.Provider value={{ token, authenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) || { token: null, authenticated: false }
