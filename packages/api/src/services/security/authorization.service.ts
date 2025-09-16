import {Service} from '../../providers/service/service';
import {AuthenticatedUser, Authority, Rights, SecurityConfig} from '../../models/security';
import {ServiceProvider} from '../../providers';
import {SecurityContextService} from './security-context.service';
import {Repository} from '../../models/repositories';
import {RepositoryService, RepositoryStorageService} from '../repository';
import {RoutingService} from '../routing/routing.service';

/**
 * Service responsible for handling authorization-related operations.
 */
export class AuthorizationService implements Service {
  private readonly repositoryService = ServiceProvider.get(RepositoryService);
  private readonly securityContextService = ServiceProvider.get(SecurityContextService);

  /**
   * Determines if free access is allowed based on the security configuration.
   * @returns {boolean} True if free access is enabled, false otherwise.
   */
  hasFreeAccess(): boolean {
    const config = this.getSecurityConfig();
    return !!(config?.enabled && config?.freeAccess.enabled);
  }

  /**
   * Checks if the user has a specific role based on the provided authority, configuration, and user details.
   * @param {Authority} role - The authority role to check.
   * @returns {boolean} True if the user has the specified role, false otherwise.
   */
  hasRole(role?: Authority): boolean {
    const config = this.getSecurityConfig();
    const user = this.getAuthenticatedUser();

    if (!role || !config?.enabled) {
      return true;
    }

    const hasPrinciple = Object.keys(user || {}).length > 0;
    if (!hasPrinciple) {
      return false;
    }

    const isAuthenticatedFully = Authority.IS_AUTHENTICATED_FULLY === role;
    const userHasAuthority = !!user?.authorities.hasAuthority(role);

    return isAuthenticatedFully || userHasAuthority;
  }

  /**
   * Checks if the current user has read permissions for the specified repository.
   * This method evaluates if the user can read the repository based on security configuration,
   * user authentication status, and user roles.
   *
   * @param {Repository} repository - The repository to check read permissions for.
   * @returns {boolean} True if the user has read permissions for the repository, false otherwise.
   */
  canReadRepo(repository?: Repository): boolean {
    if (!repository || repository.id === '') {
      return false;
    }

    const config = this.getSecurityConfig();
    const user = this.getAuthenticatedUser();

    if (config?.enabled) {
      if (!user) {
        return false;
      }
      if (this.isAdminOrRepoManager()) {
        return true;
      }
      if (this.repositoryService.isSystemRepository(repository)) {
        return false;
      }
      return this.hasBaseRights(Rights.READ, repository);
    }

    return true;
  }

  /**
   * Checks if the current user has GraphQL read permissions for the specified repository.
   * This method determines if the user can execute GraphQL read operations on the repository.
   *
   * @param {Repository} repository - The repository to check GraphQL read permissions for.
   * @returns {boolean} True if the user has GraphQL read permissions for the repository, false otherwise.
   */
  canReadGqlRepo(repository: Repository): boolean {
    if (!repository || repository.id === '') {
      return false;
    }
    return this.hasGraphqlAuthority(Rights.READ, repository);
  }

  /**
   * Checks if the current user has GraphQL write permissions for the specified repository.
   * This method determines if the user can execute GraphQL write operations on the repository.
   *
   * @param {Repository} repository - The repository to check GraphQL write permissions for.
   * @returns {boolean} True if the user has GraphQL write permissions for the repository, false otherwise.
   */
  canWriteGqlRepo(repository: Repository): boolean {
    if (!repository || repository.id === '') {
      return false;
    }
    return this.hasGraphqlAuthority(Rights.WRITE, repository);
  }

  /**
   * Checks if the current user has any GraphQL permissions (read or write) for the specified repository.
   * This is a convenience method that combines the results of canReadGqlRepo and canWriteGqlRepo.
   *
   * @param {Repository} repository - The repository to check GraphQL permissions for.
   * @returns {boolean} True if the user has any GraphQL permissions for the repository, false otherwise.
   */
  hasGqlRights(repository: Repository): boolean {
    return this.canReadGqlRepo(repository) || this.canWriteGqlRepo(repository);
  }

  /**
   * Determines if the current user has authority to access the active route.
   *
   * This method checks if the user has the necessary permissions to access the current route
   * based on the route's defined authority requirements and the user's assigned roles.
   * The method follows these rules:
   * - If no active route exists, access is denied
   * - Admin users always have access to all routes
   * - Routes without defined authority requirements are accessible to all
   * - If no repository is selected, authority checks are bypassed
   * - If the user has any of the authorities required by the route, access is granted
   *
   * @returns {boolean} True if the user has authority to access the current route, false otherwise
   */
  hasAuthority(): boolean {
    // If the user has an admin role, they always have access
    if (this.hasRole(Authority.ROLE_ADMIN)) {
      return true;
    }

    const activeRoute = ServiceProvider.get(RoutingService).getActiveRoute();
    // If there is no current active route, return false – access cannot be determined
    if (!activeRoute) {
      return false;
    }

    // If the current route doesn't define "allowAuthorities", assume there are no restrictions
    if (!activeRoute.allowAuthorities) {
      return true;
    }

    // If there is no selected repository, there are no auth restrictions
    if (!ServiceProvider.get(RepositoryStorageService).getRepositoryReference()?.id) {
      return true;
    }

    const authenticatedUser = this.getAuthenticatedUser();
    // If there is no principal defined, assume is admin and return true
    if (!authenticatedUser) {
      return true;
    }

    if (activeRoute.allowAuthorities.length) {
      const resolvedAuthorities = this.resolveAuthorities(activeRoute.allowAuthorities);
      return resolvedAuthorities.some(allowAuth => authenticatedUser.authorities.hasAuthority(allowAuth as Authority));
    }

    return true;
  }

  private resolveAuthorities(authoritiesList?: string[]) {
    // If no authorities list is provided, return empty array.
    if (!authoritiesList) {
      return [];
    }

    // Get the selected repository's ID from the current context.
    const repo = ServiceProvider.get(RepositoryStorageService).getRepositoryReference();
    // If there is no selected repository ID, return the original authorities list.
    if (!repo?.id) {
      return authoritiesList;
    }

    // Replace the "{repoId}" placeholder with the actual repository ID for specific access.
    const authListForCurrentRepo = authoritiesList.map(authority => authority.replace('{repoId}', repo.id));
    // Replace the "{repoId}" placeholder with a wildcard '*' to denote access to any repository.
    const authListForAllRepos = authoritiesList.map(authority => authority.replace('{repoId}', '*'));

    // Combine both lists into a single array and return.
    return [...authListForCurrentRepo, ...authListForAllRepos];
  }

  private getSecurityConfig(): SecurityConfig | undefined {
    return ServiceProvider.get(SecurityContextService).getSecurityConfig();
  }

  private getAuthenticatedUser(): AuthenticatedUser | undefined {
    return ServiceProvider.get(SecurityContextService).getAuthenticatedUser();
  }

  private hasBaseRights(action: string, repo: Repository): boolean {
    const repoId = this.repositoryService.getLocationSpecificId(repo);
    const overCurrentRepo = this.repositoryService.getCurrentRepoAuthority(action, repoId);
    const overAllRepos = this.repositoryService.getOverallRepoAuthority(action);

    const user = this.getAuthenticatedUser();

    return !!(
      user?.authorities.hasAuthority(overCurrentRepo as Authority) ||
      user?.authorities.hasAuthority(overAllRepos as Authority)
    );
  }

  private hasGraphqlAuthority(action: string, repo: Repository): boolean {
    const user = this.securityContextService.getAuthenticatedUser();

    if (!user) {
      return false;
    }

    const repoId = this.repositoryService.getLocationSpecificId(repo);
    const overCurrentRepoGraphql = this.repositoryService.getCurrentGqlRepoAuthority(action, repoId);
    const overAllReposGraphql = this.repositoryService.getOverallGqlRepoAuthority(action);

    return (
      user.authorities.hasAuthority(overCurrentRepoGraphql as Authority) ||
      user.authorities.hasAuthority(overAllReposGraphql as Authority)
    );
  }

  private isAdminOrRepoManager() {
    return this.hasRole(Authority.ROLE_ADMIN) || this.hasRole(Authority.ROLE_REPO_MANAGER);
  }
}
