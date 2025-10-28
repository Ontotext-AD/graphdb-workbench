/**
 * GraphDB Authorities Model
 * A string array representing authorities in GraphDB, which may have patterns like:
 * - `READ_REPO_*` - read access to all repositories
 * - `WRITE_REPO_*` - write access to all repositories
 * - `READ_REPO_<repoId>` - read access to a specific repository
 * - `WRITE_REPO_<repoId>` - write access to a specific repository
 * - `READ_REPO_*:GRAPHQL` - read access to GraphQL for all repositories
 * - `WRITE_REPO_*:GRAPHQL` - write access to GraphQL for all repositories
 * - `READ_REPO_<repoId>:GRAPHQL` - read access to GraphQL for a specific repository
 * - `WRITE_REPO_<repoId>:GRAPHQL` - write access to GraphQL for a specific repository
 * - `CUSTOM_<something>` - custom authority (role)
 *
 */
export type GraphdbAuthoritiesModel = string[];
