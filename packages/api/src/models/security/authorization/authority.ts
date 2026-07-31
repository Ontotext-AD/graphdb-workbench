export enum Authority {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_USER = 'ROLE_USER',
  ROLE_MONITORING = 'ROLE_MONITORING',
  /**
   * Grants full repository management permissions across all repositories, including creating and deleting repositories.
   */
  ROLE_REPO_MANAGER = 'ROLE_REPO_MANAGER',
  /**
   * Grants repository maintain permissions only for repositories the user is authorized to maintain.
   *
   * This authority is derived in the UI and is not returned by the backend.
   * The backend grants repository-specific permissions using authorities in the format `MAINTAIN_REPO_<repositoryId>`,
   * where `<repositoryId>` is the repository identifier. When the user has at least one such authority (or `ROLE_REPO_MANAGER`),
   * the UI adds `ROLE_REPO_MAINTAINER` to simplify permission checks.
   *
   * This authority does not grant permission to create or delete repositories.
   */
  ROLE_REPO_MAINTAINER = 'ROLE_REPO_MAINTAINER',
  ROLE_CLUSTER = 'ROLE_CLUSTER',
  IS_AUTHENTICATED_FULLY = 'IS_AUTHENTICATED_FULLY',
  SYSTEM_REPO = 'SYSTEM',
  READ_REPO = 'READ_REPO',
  READ_REPO_PREFIX = 'READ_REPO_',
  WRITE_REPO = 'WRITE_REPO',
  MAINTAIN_REPO = 'MAINTAIN_REPO',
  GRAPHQL = 'GRAPHQL',
  WRITE_REPO_PREFIX = 'WRITE_REPO_',
  MAINTAIN_REPO_PREFIX = 'MAINTAIN_REPO_',
  GRAPHQL_PREFIX = 'GRAPHQL_',
  SUFFIX_DELIMITER = ':',
  CUSTOM_PREFIX = 'CUSTOM_'
}

