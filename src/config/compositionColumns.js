import { valueAndUnits } from '../utils/format.js'

// Ingredient columns for the composition table (port of CompositionKit.defaults.columns
// .composition). Render callbacks return HTML strings, rendered via the <Html> shim.
// The "Also" and optional "Structure" columns depend on runtime config and are added by
// CompositionView.
const PCT = '%&nbsp;(w/w)'

export const compositionColumns = [
  {
    title: 'Type', className: 'left', width: '10%', data: 'relation',
    render: (val, type, full) => {
      if (val == null) return ''
      const func = val === 'HAS_ADDITIVE' ? full?.proportion?.function_as_additive : ''
      const label = String(val).substr(4).toLowerCase()
      return '<span class="camelCase">' + label + '</span>' + (func ? ' (' + func + ')' : '')
    }
  },
  {
    title: 'Name', className: 'camelCase left', width: '15%', data: 'component.compound.name',
    render: (val, type, full) => {
      const uri = full?.component?.compound?.URI
      const link = uri ? '<a href="' + uri + '" target="_blank" title="View the compound" class="jtox-compound-link">↗</a> ' : ''
      return link + (val ?? '')
    }
  },
  { title: 'EC No.', className: 'left', width: '10%', data: 'component.compound.einecs', defaultContent: '-' },
  { title: 'CAS No.', className: 'left', width: '10%', data: 'component.compound.cas', defaultContent: '-' },
  {
    title: 'Typical concentration', className: 'center', width: '15%', data: 'proportion.typical',
    render: (val) => valueAndUnits(val?.value, val?.unit || PCT, val?.precision)
  },
  {
    title: 'Concentration ranges', className: 'center', width: '15%', data: 'proportion.real',
    render: (val) => valueAndUnits(val?.lowerValue, val?.unit || PCT, val?.precision)
  },
  {
    title: 'Upper range', className: 'center', width: '15%', data: 'proportion.real',
    render: (val) => valueAndUnits(val?.upperValue, val?.unit || PCT, val?.precision)
  },
  { title: 'Also', className: 'center', orderable: false, data: 'component.compound.URI', defaultContent: '-' }
]
