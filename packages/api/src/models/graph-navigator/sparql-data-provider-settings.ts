/**
 * graphise-reactodia `SparqlDataProviderSettings`: the query preset the diagram uses to resolve types, labels
 * and links.
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
 * graphwise-reactodia `FullTextSearchSettings`: how the lookup query matches text.
 */
export interface FullTextSearchSettings {
  prefix: string;
  queryPattern: string;
  extractLabel?: boolean;
}

/**
 * graphwise-reactodia `LinkConfiguration`: a link type resolved through a SPARQL property path.
 */
export interface LinkConfiguration {
  id: string;
  domain?: readonly string[];
  path: string;
  properties?: string;
}

/**
 * graphwise-reactodia `PropertyConfiguration`: an element property resolved through a SPARQL property path.
 */
export interface PropertyConfiguration {
  id: string;
  domain?: readonly string[];
  path: string;
}
