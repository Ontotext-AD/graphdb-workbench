/**
 * Represents all repository permission types.
 */
export enum RepositoryPermissionType {
  /**
   * The user has no permission for the repository.
   */
  NONE = 'NONE',

  /**
   * The user has read permission for the repository.
   */
  READ = 'READ',

  /**
   * The user has read and write permissions for the repository.
   */
  WRITE = 'WRITE',

  /**
   * The user has repository maintain permissions, including read and write operations,
   * but not creating or deleting repositories.
   */
  MAINTAIN = 'MAINTAIN',

  /**
   * The user has permission to execute GraphQL queries.
   */
  GRAPHQL_READ = 'GRAPHQL_READ',

  /**
   * The user has permission to execute GraphQL queries and mutations.
   */
  GRAPHQL_WRITE = 'GRAPHQL_WRITE'
}
