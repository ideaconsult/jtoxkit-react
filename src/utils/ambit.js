// Ported AMBIT-specific helpers (jT.ambit.*).

// jT.ambit.formatExtIdentifiers — external identifiers as "type = id" lines, with http
// ids turned into links. type !== 'display' yields a plain comma-joined id list.
export function formatExtIdentifiers(data, type = 'display') {
  if (!Array.isArray(data)) return ''
  if (type !== 'display') return data.map((d) => d.id).join(', ')

  let html = ''
  for (let i = 0; i < data.length; ++i) {
    if (i > 0) html += '<br/>'
    let id = data[i].id
    try {
      if (typeof id === 'string' && id.startsWith('http')) {
        id = "<a href='" + id + "' target='_blank' class='qxternal'>" + id + '</a>'
      }
    } catch (e) {
      /* ignore non-string ids */
    }
    html += data[i].type + '&nbsp;=&nbsp;' + id
  }
  return html
}

// jT.ambit.getDiagramUri — turn a compound (conformer) URI into a structure image URL.
export function getDiagramUri(uri) {
  return uri && typeof uri === 'string'
    ? uri.replace(/(.+)(\/conformer.*)/, '$1') + '?media=image/png'
    : ''
}

// Substance display name + flattened external identifiers, as StudyKit.querySubstance does.
export function decorateSubstance(substance) {
  if (!substance) return substance
  return {
    ...substance,
    showname: substance.publicname || substance.name,
    extIdentifiersHtml: formatExtIdentifiers(substance.externalIdentifiers, 'display')
  }
}
