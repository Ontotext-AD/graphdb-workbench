import {
  AuthenticatedUser,
  LicenseContextService,
  mapAuthenticatedUserResponseToModel,
  RepositoryContextService,
  RepositoryList,
  RestrictionContextService,
  SecurityConfig,
  SecurityContextService,
  service,
  ViewRestriction,
} from '@ontotext/workbench-api';

/**
 * Creates a security configuration with empty app settings.
 *
 * @param enabled Whether security is enabled.
 * @returns The security configuration.
 */
export const createSecurityConfig = (enabled: boolean): SecurityConfig => new SecurityConfig({
  enabled,
  overrideAuth: {appSettings: {}},
  freeAccess: {appSettings: {}}
} as unknown as SecurityConfig);

/**
 * Creates an authenticated user the way the app does, by mapping a backend response, so the user also gets the
 * authorities the UI derives from the backend ones, e.g. ROLE_REPO_MAINTAINER.
 *
 * @param username The username.
 * @param authorities The authorities as returned by the backend.
 * @returns The authenticated user.
 */
export const createAuthenticatedUser = (username: string, authorities: string[]): AuthenticatedUser =>
  mapAuthenticatedUserResponseToModel({username, password: '', authorities, appSettings: {}, external: false});

/**
 * Resets the license, security, repository and view restriction contexts, so the state set by one test doesn't leak
 * into the next one. The contexts are shared singletons, so call it after each test that updates them.
 */
export const resetWorkbenchContexts = async (): Promise<void> => {
  service(LicenseContextService).updateGraphdbLicense(undefined);
  const securityContextService = service(SecurityContextService);
  securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
  securityContextService.updateSecurityConfig(undefined as unknown as SecurityConfig);
  const repositoryContextService = service(RepositoryContextService);
  await repositoryContextService.updateSelectedRepository();
  repositoryContextService.updateRepositoryList(undefined as unknown as RepositoryList);
  service(RestrictionContextService).updateViewRestriction(new ViewRestriction());
};
