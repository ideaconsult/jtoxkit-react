// Public package entry. Embed the viewer anywhere (like @h5web/app):
//   import SubstanceStudyViewer from '@ideaconsult/jtoxkit-react'
//   import '@ideaconsult/jtoxkit-react/style.css'
//   <SubstanceStudyViewer substanceUri={uri} apiBase="https://apps.ideaconsult.net/nanoreg1/" />
export { default, default as SubstanceStudyViewer } from './SubstanceStudyViewer'
export { useAuth } from './context/AuthContext'
export { useViewerConfig } from './context/ViewerConfig'
// jsambit: the pure-JS EffectArray model (dose-response parsing + export), reusable
// outside the viewer for other aggregate visualizations.
export * as jsambit from './jsambit/index.js'
