/**
 * Query parameter names used when opening a saved query via a direct link.
 */
export const SavedQueryParams = {
  name: 'savedQueryName',
  owner: 'owner',
} as const;

/**
 * Query parameter names used when opening a shared (ad-hoc) query via a direct link.
 */
export const SharedQueryParams = {
  name: 'name',
  owner: 'owner',
  query: 'query',
} as const;
