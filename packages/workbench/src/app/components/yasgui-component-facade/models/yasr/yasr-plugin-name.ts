/**
 * Holds all yasr plugin names.
 */
export enum YasrPluginName {
  EXTENDED_TABLE = 'extended_table',
  RAW_RESPONSE = 'response',
  EXTENDED_RESPONSE = 'extended_response',
  GOOGLE_CHARTS = 'charts',
  PIVOT_TABLE = 'pivot-table-plugin',
  TABLE = 'table',
  GEO = 'geo',
}

/**
 * Maps user-friendly plugin names to their corresponding internal YASR plugin IDs.
 *
 * This mapping allows users to select a plugin in a more intuitive way,
 * without needing to know the exact internal ID of each plugin.
 */
export const URL_PLUGIN_NAME_TO_PLUGIN_NAME_MAPPING = {
  table: YasrPluginName.EXTENDED_TABLE,
  rawResponse: YasrPluginName.EXTENDED_RESPONSE,
  geo: YasrPluginName.GEO,
  googleChart: YasrPluginName.GOOGLE_CHARTS,
  pivotTable: YasrPluginName.PIVOT_TABLE,
} as const;

export type URLPluginName = keyof typeof URL_PLUGIN_NAME_TO_PLUGIN_NAME_MAPPING;
