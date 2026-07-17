import {Repository, RepositoryPermissionType} from '../repositories';

/**
 * Defines a rule for resolving the repository permission granted to the current user.
 */
export interface RepositoryPermissionResolver {
  /**
   * Determines the precedence of this resolver when multiple resolvers match.
   * Higher values take precedence over lower values.
   */
  readonly priority: number;

  /**
   * Permission returned when this resolver matches.
   */
  readonly permission: RepositoryPermissionType;

  /**
   * Returns whether this permission is granted for the given repository.
   */
  readonly matches: (repository: Repository) => boolean;
}
