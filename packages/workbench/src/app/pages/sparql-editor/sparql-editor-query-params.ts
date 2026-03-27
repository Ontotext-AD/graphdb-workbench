/**
 * Query parameter names used when opening a saved query via a direct link.
 */
export const SavedQueryParams = {
  name: 'savedQueryName',
  owner: 'owner',
  execute: 'execute',
} as const;

/**
 * Query parameter names used when opening a shared (ad-hoc) query via a direct link.
 */
export const SharedQueryParams = {
  name: 'name',
  owner: 'owner',
  query: 'query',
  execute: 'execute',
} as const;

export const YasguiQueryParams = {
  // Query parameter flag used to determine if the query should be executed immediately after being loaded in the editor.
  EXECUTE: 'execute',
  // Query parameter flag used to determine if the editor visualization should be opened in embedded mode.
  EMBEDDED: 'embedded',
  // Query parameter used to configure the concrete operation that should be performed on results click.
  YASGUI_OPERATION: 'yasguiOperation',
} as const;
