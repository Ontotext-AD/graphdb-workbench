import {MapperFn} from '../../../../providers';
import {GraphNavigatorSettings} from '../../../../models/graph-navigator';
import {GraphNavigatorSettingsResponse} from '../response/graph-navigator-settings-response';

/**
 * Maps the {@link GraphNavigatorSettingsResponse} server data to a {@link GraphNavigatorSettings} model.
 *
 * @param data - The server response.
 * @returns The mapped {@link GraphNavigatorSettings}.
 */
export const mapGraphNavigatorSettingsResponseToModel: MapperFn<GraphNavigatorSettingsResponse, GraphNavigatorSettings> = (data) => {
  return new GraphNavigatorSettings({
    uploaded: data.uploaded,
    providerSettings: {
      defaultPrefix: data.defaultPrefix,
      schemaLabelProperty: data.schemaLabelProperty,
      dataLabelProperty: data.dataLabelProperty,
      filterOnlyLanguages: data.filterOnlyLanguages,
      acceptBlankNodes: data.acceptBlankNodes,
      blankNodeStatementLimit: data.blankNodeStatementLimit,
      classTreeQuery: data.classTreeQuery,
      classInfoQuery: data.classInfoQuery,
      linkTypesQuery: data.linkTypesQuery,
      linkTypesPattern: data.linkTypesPattern,
      linkTypesInfoQuery: data.linkTypesInfoQuery,
      propertyInfoQuery: data.propertyInfoQuery,
      elementInfoQuery: data.elementInfoQuery,
      linksInfoQuery: data.linksInfoQuery,
      imageQueryPattern: data.imageQueryPattern,
      linkTypesOfQuery: data.linkTypesOfQuery,
      linkTypesStatisticsQuery: data.linkTypesStatisticsQuery,
      lookupQuery: data.lookupQuery,
      filterInnerPrelude: data.filterInnerPrelude,
      filterRefElementLinkPattern: data.filterRefElementLinkPattern,
      filterTypePattern: data.filterTypePattern,
      filterElementInfoPattern: data.filterElementInfoPattern,
      filterAdditionalRestriction: data.filterAdditionalRestriction,
      fullTextSearch: {
        prefix: data.fullTextSearch.prefix,
        queryPattern: data.fullTextSearch.queryPattern,
        extractLabel: data.fullTextSearch.extractLabel
      },
      linkConfigurations: data.linkConfigurations.map((link) => ({
        id: link.id,
        domain: link.domain,
        path: link.path,
        properties: link.properties
      })),
      openWorldLinks: data.openWorldLinks,
      propertyConfigurations: data.propertyConfigurations.map((property) => ({
        id: property.id,
        domain: property.domain,
        path: property.path
      })),
      openWorldProperties: data.openWorldProperties
    }
  });
};
