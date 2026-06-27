// Shims for globals the verbatim jToxKit config render() callbacks rely on. Those configs
// were classic, non-strict <script> files; ES modules are strict, so two things break:
//   1. jQuery `$.each(obj, cb)` must exist, and
//   2. implicit globals assigned without `var` (iuuid, auuid) must be predeclared —
//      otherwise strict mode throws ReferenceError on the assignment.
// Importing this module (side effect) installs both. It is imported by config/studyColumns.

const g = typeof globalThis !== 'undefined' ? globalThis : window

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
