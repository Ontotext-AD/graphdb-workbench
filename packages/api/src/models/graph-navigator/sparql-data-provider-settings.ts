/**
 * Reactodia `SparqlDataProviderSettings`: the query preset the diagram uses to resolve types, labels
 * and links. The object is passed to the diagram as-is.
 *
 * A copy of the type from `@reactodia/workspace` rather than a re-export from `graphwise-reactodia`:
 * that package keeps `@reactodia/workspace` as a `file:` devDependency and does not publish it, so a
 * re-export would leave an unresolvable import in the typings, which `skipLibCheck` turns into `any`.
 * Keep it in sync with Reactodia's `sparqlDataProviderSettings.ts`.
 */
export interface SparqlDataProviderSettings {
  defaultPrefix: string;
  schemaLabelProperty: string;
  dataLabelProperty: string;
  filterOnlyLanguages?: readonly string[];
  acceptBlankNodes?: boolean;
  blankNodeStatementLimit?: number;
  classTreeQuery?: string;
  classInfoQuery?: string;
  linkTypesQuery?: string;
  linkTypesPattern?: string;
  linkTypesInfoQuery?: string;
  propertyInfoQuery?: string;
  elementInfoQuery: string;
  linksInfoQuery: string;
  imageQueryPattern: string;
  linkTypesOfQuery: string;
  linkTypesStatisticsQuery: string;
  lookupQuery: string;
  filterInnerPrelude?: string;
  filterRefElementLinkPattern: string;
  filterTypePattern: string;
  filterElementInfoPattern: string;
  filterAdditionalRestriction: string;
  fullTextSearch: FullTextSearchSettings;
  linkConfigurations: LinkConfiguration[];
  openWorldLinks?: boolean;
  propertyConfigurations: PropertyConfiguration[];
  openWorldProperties?: boolean;
}

/**
 * Reactodia `FullTextSearchSettings`: how the lookup query matches text.
 */
export interface FullTextSearchSettings {
  prefix: string;
  queryPattern: string;
  extractLabel?: boolean;
}

/**
 * Reactodia `LinkConfiguration`: a link type resolved through a SPARQL property path.
 */
export interface LinkConfiguration {
  id: string;
  domain?: readonly string[];
  path: string;
  properties?: string;
}

/**
 * Reactodia `PropertyConfiguration`: an element property resolved through a SPARQL property path.
 */
export interface PropertyConfiguration {
  id: string;
  domain?: readonly string[];
  path: string;
}
