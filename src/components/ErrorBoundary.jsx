import { Component } from 'react'

// Catches render/runtime errors in children and shows them on screen instead of letting
// the subtree silently unmount (which looks like a "flash then disappear").
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('[jtoxkit ErrorBoundary]', this.props.label || '', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            border: '2px solid #dc2626', background: '#fff5f5', color: '#dc2626',
            padding: '12px 16px', borderRadius: '8px', font: '13px/1.5 monospace',
            whiteSpace: 'pre-wrap', overflow: 'auto'
          }}
        >
          <strong>{this.props.label || 'Error'} crashed:</strong>{'\n'}
          {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
        </div>
      )
    }
    return this.props.children
  }
}
