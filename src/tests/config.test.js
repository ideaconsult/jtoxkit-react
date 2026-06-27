import { describe, it, expect } from 'vitest'
import { config_study } from '../config/studyColumns.js'

describe('bundled config_study', () => {
  it('exposes the default + many category sections', () => {
    const c = config_study.columns
    expect(c._).toBeTruthy()
    expect(Object.keys(c).length).toBeGreaterThan(50)
    expect(c.GI_GENERAL_INFORM_SECTION).toBeTruthy()
    expect(c.EC_FISHTOX_SECTION).toBeTruthy()
  })

  it('hides the main Name column by default', () => {
    expect(config_study.columns._.main.name.visible).toBe(false)
  })
})
