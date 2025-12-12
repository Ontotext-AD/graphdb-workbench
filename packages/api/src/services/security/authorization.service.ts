import {Service} from '../../providers/service/service';
import {AuthenticatedUser, Authority, Rights, SecurityConfig} from '../../models/security';
import {service} from '../../providers';
import {SecurityContextService} from './security-context.service';
import {Repository} from '../../models/repositories';
import {RepositoryContextService, RepositoryService, RepositoryStorageService} from '../repository';
import {RoutingService} from '../routing/routing.service';
import {WindowService} from '../window';
import {ExtensionPoint, ExternalMenuModel} from '../../models/plugins';
import {ExternalRouteModel} from '../../models/plugins/extension-models/external-route-item-model';

/**
 * Service responsible for handling authorization-related operations.
 */
export class AuthorizationService implements Service {
  private readonly repositoryService = service(RepositoryService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly repositoryStorageService = service(RepositoryStorageService);
  private readonly repositoryContextService = service(RepositoryContextService);

  /**
   * Determines if free access is allowed based on the security configuration.
   * @returns {boolean} True if free access is enabled, false otherwise.
   */
  hasFreeAccess(): boolean {
    const config = this.getSecurityConfig();
    return !!(config?.isEnabled() && config?.freeAccess?.enabled);
  }

  initializeFreeAccess(): void {
    const config = this.getSecurityConfig();
    if (config?.isEnabled() && config?.isFreeAccessEnabled()) {
      const freeAccessUser = new AuthenticatedUser()
        .setAuthorities(config.freeAccess.authorities)
        .setAppSettings(config.freeAccess.appSettings);
      this.securityContextService.updateAuthenticatedUser(freeAccessUser);
    }
  }

  /**
   * Overrides the default (admin) user, when no security is enabled.
   * This is done by setting graphdb.workbench.default.auth=true.
   *
   * When a user does this, he will get a repository manager user instead of the admin. He has the ability to override
   * the user's app settings and authorities.
   */
  initializeOverrideAuth(): void {
    const config = this.getSecurityConfig();
    if (!config?.isEnabled() && config?.hasOverrideAuth()) {
      const overrideAuthUser = new AuthenticatedUser();
      overrideAuthUser.username = 'overrideauth';
      overrideAuthUser.setAuthorities(config.overrideAuth.authorities);
      overrideAuthUser.setAppSettings(config.overrideAuth.appSettings);
      this.securityContextService.updateAuthenticatedUser(overrideAuthUser);
    }
  }

  /**
   * Checks if the current user has an admin role.
   * @returns {boolean} True if the user has an admin role, false otherwise.
   */
  isAdmin(): boolean {
    return this.hasRole(Authority.ROLE_ADMIN);
  }

  /**
   * Checks if the current user has the repository manager role.
   * @returns {boolean} True if the user has the repository manager role, false otherwise.
   */
  isRepoManager(): boolean {
    return this.hasRole(Authority.ROLE_REPO_MANAGER);
  }

  /**
   * Checks if the user has a specific role based on the provided authority, configuration, and user details.
   * @param {Authority} role - The authority role to check.
   * @returns {boolean} True if the user has the specified role, false otherwise.
   */
  hasRole(role?: Authority): boolean {
    const config = this.getSecurityConfig();
    const user = this.getAuthenticatedUser();

    if (!role || (!config?.isEnabled() && !config?.hasOverrideAuth())) {
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

    if (config?.isEnabled()) {
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
   * Checks if the current user has write permissions for the specified repository.
   * This method evaluates if the user can write to the repository based on security configuration,
   * user authentication status, and user roles.
   * @param repository - The repository to check write permissions for.
   * @returns True if the user has write permissions for the repository, false otherwise.
   */
  canWriteRepo(repository?: Repository): boolean {
    if (!repository || repository.id === '') {
      return false;
    }

    const config = this.getSecurityConfig();
    const user = this.getAuthenticatedUser();

    if (config?.isEnabled() || config?.hasOverrideAuth()) {
      if (!user) {
        return false;
      }
      if (this.isAdminOrRepoManager()) {
        return true;
      }
      if (this.repositoryService.isSystemRepository(repository)) {
        return false;
      }
      return this.hasBaseRights(Rights.WRITE, repository);
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
  canReadGqlRepo(repository?: Repository): boolean {
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
  canWriteGqlRepo(repository?: Repository): boolean {
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
   * Checks if the current user has any GraphQL permissions (read or write) for the active repository.
   * @returns True if the user has any GraphQL permissions for the current repository, false otherwise.
   */
  hasGraphqlRightsOverCurrentRepo(): boolean {
    const activeRepoReference = this.repositoryStorageService.getRepositoryReference();
    const activeRepo = this.repositoryContextService.findRepository(activeRepoReference);
    return this.canReadGqlRepo(activeRepo) || this.canWriteGqlRepo(activeRepo);
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
    // TODO: This needs to be revisited. Why it was implemented? Why do we need granular control of restrictedPages?
    // If the user has an admin or repository manager role, they always have access
    if (this.isAdminOrRepoManager()) {
      return true;
    }

    const activeRoute = service(RoutingService).getActiveRoute();
    // If there is no current active route, return false – access cannot be determined
    if (!activeRoute) {
      return false;
    }

    // If the current route doesn't define "allowAuthorities", assume there are no restrictions
    if (!activeRoute.allowAuthorities) {
      return true;
    }

    // If there is no selected repository, there are no auth restrictions
    if (!service(RepositoryStorageService).getRepositoryReference()?.id) {
      return true;
    }

    const authenticatedUser = this.getAuthenticatedUser();
    // If there is no principal defined, assume is admin and return true
    if (!authenticatedUser) {
      return true;
    }

    if (activeRoute.allowAuthorities.length) {
      const resolvedAuthorities = this.resolveAuthorities(activeRoute.allowAuthorities);
      return resolvedAuthorities.some(allowAuth => authenticatedUser.authorities.hasAuthority(allowAuth as Authority))
        || resolvedAuthorities.some(allowAuth => authenticatedUser.authorities.hasWildcardAuthority(allowAuth as Authority));
    }

    return true;
  }

  /**
   * Updates the permissions for restricted pages based on the current user's roles and authorities.
   */
  updatePermissions() {
    const restrictedPages = this.securityContextService.getRestrictedPages();
    const user = this.securityContextService.getAuthenticatedUser();

    const isAdministratorUser = this.isAdmin();

    const routes = WindowService.getWindow().PluginRegistry.get<ExternalRouteModel>(ExtensionPoint.ROUTE);
    const menuItems = WindowService.getWindow().PluginRegistry.get<ExternalMenuModel>(ExtensionPoint.MAIN_MENU);

    routes.forEach((route) => {
      const menuItem = menuItems.flatMap((mi) => mi.items)
        .filter((menuItem) => menuItem.role?.startsWith('ROLE_'))
        .find((menuItem) => route.url.includes(menuItem.href));

      if (!menuItem) {
        return;
      }

      const isAccessToPageRestricted = !isAdministratorUser && !user?.authorities.hasAuthority(menuItem.role ?? '');
      restrictedPages.setPageRestriction(route.url, isAccessToPageRestricted);
    });

    this.securityContextService.updateRestrictedPages(restrictedPages);
  };

  private resolveAuthorities(authoritiesList?: string[]) {
    // If no authorities list is provided, return empty array.
    if (!authoritiesList) {
      return [];
    }

    // Get the selected repository's ID from the current context.
    const repo = service(RepositoryStorageService).getRepositoryReference();
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
    return service(SecurityContextService).getSecurityConfig();
  }

  private getAuthenticatedUser(): AuthenticatedUser | undefined {
    return service(SecurityContextService).getAuthenticatedUser();
  }

  private hasBaseRights(action: string, repo: Repository): boolean {
    const repoId = this.repositoryService.getLocationSpecificId(repo);
    const overCurrentRepo = this.repositoryService.getCurrentRepoAuthority(action, repoId);
    const overAllRepos = this.repositoryService.getOverallRepoAuthority(action);

    const user = this.getAuthenticatedUser();

    return !!(
      user?.authorities.hasAuthority(overCurrentRepo as Authority) ||
      user?.authorities.hasAuthority(overAllRepos as Authority) ||
      user?.authorities.hasWildcardAuthority(overCurrentRepo)
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
      user.authorities.hasAuthority(overAllReposGraphql as Authority) ||
      user.authorities.hasWildcardAuthority(overCurrentRepoGraphql, true)
    );
  }

  private isAdminOrRepoManager() {
    return this.hasRole(Authority.ROLE_ADMIN) || this.hasRole(Authority.ROLE_REPO_MANAGER);
  }
}
