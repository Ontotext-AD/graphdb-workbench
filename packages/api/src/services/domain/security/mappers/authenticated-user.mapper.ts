import {AuthenticatedUser} from '../../../../models/security';
import {AuthenticatedUserResponse} from '../../../../models/security';
import {Authority, AuthorityList} from '../../../../models/security';
import {AppSettings} from '../../../../models/users';
import {MapperFn} from '../../../../providers';

/**
 * Mapper class for converting partial AuthenticatedUser objects to complete AuthenticatedUser models.
 */
export const mapAuthenticatedUserResponseToModel: MapperFn<AuthenticatedUserResponse, AuthenticatedUser> = (data) => {
  return new AuthenticatedUser({
    username: data.username,
    password: data.password,
    authorities: new AuthorityList(normalizeAuthorities(data.authorities)),
    appSettings: new AppSettings(data.appSettings),
    external: data.external
  });
};

/**
 * Normalizes the authorities returned by the backend.
 *
 * The backend grants repository-specific management permissions using authorities in the format `MANAGE_REPO_<repositoryId>`.
 * To simplify permission checks in the UI, this function adds the derived `ROLE_MANAGE_REPO` authority when the user has
 * `ROLE_REPO_MANAGER` or at least one `MANAGE_REPO_<repositoryId>` authority.
 *
 * @param authorities The authorities returned by the backend.
 * @returns A normalized list of authorities, including the derived `ROLE_MANAGE_REPO` authority when applicable.
 */
const normalizeAuthorities = (authorities: string[]): string[] => {
  if (!authorities) {
    return [];
  }
  const normalizedAuthorities = [...authorities];
  const canManageRepo = normalizedAuthorities.some((authority) => {
    return authority === Authority.ROLE_REPO_MANAGER ||
      authority.startsWith(Authority.MANAGE_REPO_PREFIX);
  });

  if (canManageRepo) {
    normalizedAuthorities.push(Authority.ROLE_MANAGE_REPO);
  }

  return normalizedAuthorities;
};
