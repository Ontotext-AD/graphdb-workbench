/**
 * Represents all repository permission types.
 */
export enum RepositoryPermissionType {
  /**
   * The user has no permission for the repository.
   */
  NONE = 'none',

  /**
   * The user has read permission for the repository.
   */
  READ = 'read',

  /**
   * The user has read and write permissions for the repository.
   */
  WRITE = 'write',

  /**
   * The user has repository management permissions, including read and write operations,
   * but not creating or deleting repositories.
   */
  MANAGE = 'manage',

  /**
   * The user has permission to execute GraphQL queries.
   */
  GRAPHQL_READ = 'graphql_read',

  /**
   * The user has permission to execute GraphQL queries and mutations.
   */
  GRAPHQL_WRITE = 'graphql_write'
}
