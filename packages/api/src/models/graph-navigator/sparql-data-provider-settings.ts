/**
 * Reactodia `SparqlDataProviderSettings`: the query preset the diagram uses to resolve types, labels
 * and links. The object is passed to the diagram as-is.
 *
 * Declared loosely rather than reused from `graphwise-reactodia`, because the real type lives in
 * `@reactodia/workspace`, which that package keeps as a `file:` devDependency and does not publish.
 * Re-exporting it leaves an unresolvable import in the typings, which `skipLibCheck` silently turns
 * into `any` — a type that looks checked but enforces nothing.
 */
export type SparqlDataProviderSettings = Record<string, unknown>;
