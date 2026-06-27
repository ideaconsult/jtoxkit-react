// Faithful ports of jToxKit value / units / range formatters. They return HTML
// strings (with &nbsp;, <sup>, <span class="units">…) exactly like the originals, so
// the existing per-category config render() callbacks keep working. The strings are
// rendered through the sanitizing <Html> shim.

export const trim = (v) => (v == null ? '' : String(v).trim())

// jT.nicifyNumber — round to the shortest precision that reproduces the value.
export function nicifyNumber(num, prec) {
  if (num == null) return ''
  const maxPrec = Math.pow(10, prec || 9)
  let rounded
  let p
  for (p = 10; p < maxPrec; p *= 10) {
    rounded = Math.round(num * p)
    if (Math.abs(rounded - num * p) < 0.1) break
  }
  return parseInt(rounded, 10) / p
}

// jT.formatUnits — micro sign, exponents as <sup>, non-breaking spaces.
export function formatUnits(str) {
  return !str
    ? ''
    : str
        .toString()
        .replace(/(^|\W)u(\w)/g, '$1&#x00B5;$2')
        .replace(/\^\(?([\-\d]+)\)?/g, '<sup>$1</sup>')
        .replace(/ /g, '&nbsp;')
}

// jT.valueAndUnits
export function valueAndUnits(val, unit, prec) {
  let out = ''
  if (val != null) {
    val = typeof val === 'string' ? trim(val) : String(nicifyNumber(val, prec))
    out += val.replace(/ /g, '&nbsp;')
    out += formatUnits(unit)
  }
  return out
}

// jT.ui.renderRange — a scalar, or a {loValue, upValue, loQualifier, upQualifier, unit}
// range, formatted with brackets / qualifiers and an optional units span.
export function renderRange(data, unit, type, prefix) {
  let out = ''
  if (typeof data === 'string' || typeof data === 'number') {
    out += type !== 'display'
      ? data
      : (prefix ? prefix + '&nbsp;=&nbsp;' : '') + valueAndUnits(data, unit)
  } else if (typeof data === 'object' && data != null) {
    const loValue = trim(data.loValue)
    const upValue = trim(data.upValue)

    if (String(loValue) !== '' && String(upValue) !== '' && !!data.upQualifier && data.loQualifier !== '=') {
      if (prefix) out += prefix + '&nbsp;=&nbsp;'
      out += data.loQualifier === '>=' ? '[' : '('
      out += loValue + ', ' + upValue
      out += data.upQualifier === '<=' ? ']' : ') '
    } else {
      const fnFormat = (p, q, v) => {
        let o = ''
        if (p) o += p + ' '
        if (q) o += p || q !== '=' ? q + ' ' : ''
        return o + v
      }
      if (String(loValue) !== '') out += fnFormat(prefix, data.loQualifier || '=', loValue)
      else if (String(upValue) !== '') out += fnFormat(prefix, data.upQualifier || '=', upValue)
      else if (prefix) out += prefix
      else out += type === 'display' ? '-' : ''
    }

    out = out.replace(/ /g, '&nbsp;')
    if (type === 'display') {
      unit = trim(data.unit || unit)
      if (unit) out += '&nbsp;<span class="units">' + unit.replace(/ /g, '&nbsp;') + '</span>'
    }
  } else {
    out += '-'
  }
  return out
}
