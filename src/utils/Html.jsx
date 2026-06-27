import DOMPurify from 'dompurify'

// Compatibility shim: render an HTML string (produced by ported jToxKit formatters or
// by the existing config render() callbacks) as sanitized HTML inside the scoped root.
// A non-string value is rendered as a normal React child, so new configs may return
// React nodes instead of HTML strings.
export function Html({ html, as: Tag = 'span', className }) {
  if (html == null || html === '') return null
  if (typeof html !== 'string') {
    return <Tag className={className}>{html}</Tag>
  }
  const clean = DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: clean }} />
}
