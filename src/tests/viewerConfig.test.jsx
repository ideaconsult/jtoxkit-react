import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import {
  DEFAULT_VIEWER_CONFIG,
  ViewerConfigProvider,
  useViewerConfig
} from '../context/ViewerConfig.jsx'

afterEach(cleanup)

function Probe() {
  const config = useViewerConfig()
  return <pre data-testid="config">{JSON.stringify(config)}</pre>
}

function readConfig(value) {
  render(
    <ViewerConfigProvider value={value}>
      <Probe />
    </ViewerConfigProvider>
  )
  return JSON.parse(screen.getByTestId('config').textContent)
}

describe('ViewerConfigProvider', () => {
  it('exposes explicit package defaults without a provider', () => {
    render(<Probe />)
    expect(JSON.parse(screen.getByTestId('config').textContent)).toEqual(DEFAULT_VIEWER_CONFIG)
  })

  it('uses explicit package defaults', () => {
    expect(readConfig()).toEqual({
      apiBase: '',
      convertBase: '',
      showDiagrams: false,
      columnConfig: null,
      proxyFrom: '',
      proxyTo: ''
    })
  })

  it('normalizes URL-like base overrides', () => {
    expect(readConfig({
      apiBase: 'https://apps.ideaconsult.net/nanoreg1/',
      convertBase: 'https://api.ramanchada.ideaconsult.net/'
    })).toMatchObject({
      apiBase: 'https://apps.ideaconsult.net/nanoreg1',
      convertBase: 'https://api.ramanchada.ideaconsult.net'
    })
  })

  it('ignores nullish overrides and keeps other config props', () => {
    const columnConfig = { _: { main: [] } }
    expect(readConfig({
      apiBase: undefined,
      convertBase: null,
      showDiagrams: true,
      columnConfig,
      proxyFrom: 'https://apps.ideaconsult.net',
      proxyTo: '/ambit'
    })).toEqual({
      apiBase: '',
      convertBase: '',
      showDiagrams: true,
      columnConfig,
      proxyFrom: 'https://apps.ideaconsult.net',
      proxyTo: '/ambit'
    })
  })
})
