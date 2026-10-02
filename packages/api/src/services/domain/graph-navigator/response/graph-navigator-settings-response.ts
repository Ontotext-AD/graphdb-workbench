/**
* The `repositories/{repositoryId}/graph-navigator/settings` response. Contains graph navigator settings.
*/
export interface GraphNavigatorSettingsResponse {
  /** Whether the settings were uploaded for the repository. `false` means the defaults are in use. */
  uploaded: boolean;
  defaultPrefix: string;
  schemaLabelProperty: string;
  dataLabelProperty: string;
  filterOnlyLanguages?: string[];
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
  fullTextSearch: {
    prefix: string;
    queryPattern: string;
    extractLabel?: boolean;
  };
  linkConfigurations: {
    id: string;
    domain?: string[];
    path: string;
    properties?: string;
  }[];
  openWorldLinks?: boolean;
  propertyConfigurations: {
    id: string;
    domain?: string[];
    path: string;
  }[];
  openWorldProperties?: boolean;
}
