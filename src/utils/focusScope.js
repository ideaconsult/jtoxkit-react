// Locating a focused study (document_uuid = AMBIT study.uuid) among the category groups
// of one topcategory tab. A deep link points at one study, so the tab narrows to the group
// holding it -- scoping only inside that group would leave every other category on screen,
// which for a substance with a few hundred studies is indistinguishable from no scope.

/** The category group whose studies include `focusUuid`, or null when none does. */
export function groupWithStudy(groups, focusUuid) {
  if (!focusUuid) return null
  return (groups || []).find((g) => (g.studies || []).some((s) => s.uuid === focusUuid)) || null
}

/** Total studies across groups — what "Show all N studies" counts. */
export function countStudies(groups) {
  return (groups || []).reduce((n, g) => n + (g.studies?.length || 0), 0)
}
