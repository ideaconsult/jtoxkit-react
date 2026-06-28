import DOMPurify from 'dompurify'

// Compatibility shim: render an HTML string (produced by ported jToxKit formatters or
// by the existing config render() callbacks) as sanitized HTML inside the scoped root.
// A non-string value is rendered as a normal React child, so new configs may return
// React nodes instead of HTML strings. When used as a table cell (`as="td"/"th"`), an
// empty value still renders an (empty) cell so the table layout stays intact, and
// rowSpan/colSpan/style are forwarded.
export function Html({ html, as: Tag = 'span', className, rowSpan, colSpan, style }) {
  const isCell = Tag === 'td' || Tag === 'th'
  if (html == null || html === '') {
    return isCell ? <Tag className={className} rowSpan={rowSpan} colSpan={colSpan} style={style} /> : null
  }
  if (typeof html !== 'string') {
    return (
      <Tag className={className} rowSpan={rowSpan} colSpan={colSpan} style={style}>
        {html}
      </Tag>
    )
  }
  const clean = DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })
  return (
    <Tag
      className={className}
      rowSpan={rowSpan}
      colSpan={colSpan}
      style={style}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
