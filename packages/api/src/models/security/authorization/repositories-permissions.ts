/**
 * Repositories permissions model.
 * Used in the users catalog component to display user's authorities.
 */
export type RepositoriesPermissions = Record<string, Permissions>
type Permissions = { read: boolean, write: boolean, graphql: boolean };
