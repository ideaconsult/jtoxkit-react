import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'

beforeEach(() => {
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
})

afterEach(cleanup)

function Probe() {
  const auth = useAuth()
  return <pre data-testid="auth">{JSON.stringify(auth)}</pre>
}

function readAuth() {
  return JSON.parse(screen.getByTestId('auth').textContent)
}

describe('AuthProvider', () => {
  it('uses a controlled token prop without reading URL token state', () => {
    window.history.replaceState(null, '', '/?token=url-token')

    render(
      <AuthProvider token="prop-token">
        <Probe />
      </AuthProvider>
    )

    expect(readAuth()).toEqual({ token: 'prop-token', authenticated: true })
    expect(sessionStorage.getItem('jtoxkit_token')).toBeNull()
    expect(window.location.search).toBe('?token=url-token')
  })

  it('updates when the controlled token prop changes', async () => {
    const { rerender } = render(
      <AuthProvider token="one">
        <Probe />
      </AuthProvider>
    )

    rerender(
      <AuthProvider token="two">
        <Probe />
      </AuthProvider>
    )

    await waitFor(() => expect(readAuth()).toEqual({ token: 'two', authenticated: true }))
  })

  it('reads, stores, and removes an uncontrolled URL token', () => {
    window.history.replaceState(null, '', '/?token=url-token&tab=TOX')

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    expect(readAuth()).toEqual({ token: 'url-token', authenticated: true })
    expect(sessionStorage.getItem('jtoxkit_token')).toBe('url-token')
    expect(window.location.search).toBe('?tab=TOX')
  })

  it('accepts an uncontrolled postMessage token', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    window.postMessage({ type: 'keycloak_token', token: 'posted-token' }, '*')

    await waitFor(() => {
      expect(readAuth()).toEqual({ token: 'posted-token', authenticated: true })
    })
    expect(sessionStorage.getItem('jtoxkit_token')).toBe('posted-token')
  })
})
