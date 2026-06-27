// Data-source adapter contract (see plan: "Data layer — modular, swappable").
//
// A source exposes these async methods, each returning an AMBIT-shaped model so the
// column config + renderers work regardless of backend:
//   resolve(uri)                        -> absolute URL string
//   getJson(uri, { signal })            -> parsed JSON (escape hatch / arbitrary AMBIT URI)
//   getSubstance(uri, opts)             -> substance record | null
//   getReferenceSubstance(uri, opts)    -> dataset { dataEntry[], feature{} }
//   getStudySummary(uri, opts)          -> facet[] of { topcategory, category, count }
//   getStudies(categoryUri, opts)       -> study[]
//   getComposition(uri, opts)           -> { composition[], feature{} }
//
// AMBIT implementation: ./ambitSource (createAmbitSource).
// Future: ./solrSource — maps ramanchada-api /db/query docs to the same shape (pyambit).
export { createAmbitSource } from './ambitSource'
