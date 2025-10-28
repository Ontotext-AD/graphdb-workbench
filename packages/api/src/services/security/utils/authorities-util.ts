import {Authority} from '../../../models/security/authorization/authority';

export interface RepoAuthority {
  prefix: Authority;
  repo: string;
}

export class AuthoritiesUtil {

  /**
   * Given an authority string, returns an object with the prefix used and the repository id.
   * Returns null if the authority does not start with a known repo prefix.
   *
   * @param role - The authority code, expected to start with a known prefix.
   * @returns A RepoAuthority object or null if no known prefix matches.
   */
  static getRepoFromAuthority (role: string): RepoAuthority | null {
    if (role.startsWith(Authority.READ_REPO_PREFIX)) {
      return {prefix: Authority.READ_REPO_PREFIX, repo: role.substring(Authority.READ_REPO_PREFIX.length)};
    }
    if (role.startsWith(Authority.WRITE_REPO_PREFIX)) {
      return {prefix: Authority.WRITE_REPO_PREFIX, repo: role.substring(Authority.WRITE_REPO_PREFIX.length)};
    }
    if (role.startsWith(Authority.GRAPHQL_PREFIX)) {
      return {prefix: Authority.GRAPHQL_PREFIX, repo: role.substring(Authority.GRAPHQL_PREFIX.length)};
    }
    return null;
  }
}
