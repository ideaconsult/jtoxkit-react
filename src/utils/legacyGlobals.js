// Shims for globals the verbatim jToxKit config render() callbacks rely on. Those configs
// were classic, non-strict <script> files; ES modules are strict, so two things break:
//   1. jQuery `$.each(obj, cb)` must exist, and
//   2. implicit globals assigned without `var` (iuuid, auuid) must be predeclared —
//      otherwise strict mode throws ReferenceError on the assignment.
//
// IMPORTANT: this is exposed as an EXPORTED function that config/studyColumns.js imports
// and CALLS. A bare side-effect `import './legacyGlobals.js'` is fragile — the library
// build tree-shakes it away (package.json `sideEffects` marks non-CSS modules pure), which
// silently empties the Protocol (uses $.each) and Reference (assigns iuuid/auuid) columns
// in the built bundle while dev still works. A used export call can never be dropped.

function each(collection, cb) {
  if (collection == null) return collection
  if (Array.isArray(collection)) {
    for (let i = 0; i < collection.length; i++) {
      if (cb.call(collection[i], i, collection[i]) === false) break
    }
  } else if (typeof collection === 'object') {
    for (const k in collection) {
      if (cb.call(collection[k], k, collection[k]) === false) break
    }
  }
  return collection
}

let installed = false

// Install the jQuery `$` shims and predeclare the iuuid/auuid globals. Idempotent.
export function installLegacyGlobals() {
  if (installed) return
  const g = typeof globalThis !== 'undefined' ? globalThis : window
  const jq = g.$ || {}
  if (typeof jq.each !== 'function') jq.each = each
  if (typeof jq.extend !== 'function') {
    jq.extend = (...a) => {
      const deep = a[0] === true
      const args = deep ? a.slice(1) : a
      return Object.assign(args[0] || {}, ...args.slice(1))
    }
  }
  if (typeof jq.map !== 'function') jq.map = (arr, fn) => (Array.isArray(arr) ? arr.map((v, i) => fn(v, i)).filter((v) => v != null) : [])
  if (typeof jq.inArray !== 'function') jq.inArray = (v, arr) => (Array.isArray(arr) ? arr.indexOf(v) : -1)
  if (typeof jq.trim !== 'function') jq.trim = (s) => (s == null ? '' : String(s).trim())
  g.$ = jq
  // Predeclare the implicit globals the config render() callbacks assign without `var`.
  if (!('iuuid' in g)) g.iuuid = undefined
  if (!('auuid' in g)) g.auuid = undefined
  installed = true
}

// Run on import too, so plain `import './legacyGlobals.js'` (e.g. in tests) still works.
installLegacyGlobals()
