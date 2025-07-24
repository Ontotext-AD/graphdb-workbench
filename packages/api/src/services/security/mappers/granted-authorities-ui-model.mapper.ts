import {AuthorityList} from '../../../models/security/authority-list';
import {Mapper} from '../../../providers/mapper/mapper';
import {Authority} from '../../../models/security/authority';

/**
 * Mapper for converting an array of authority strings into an AuthorityList model.
 *
 * This class handles suffix-delimited authorities (e.g. "READ_REPO_ABC:GRAPHQL"),
 * extracting repository-specific GraphQL rights and including both the base and UI-specific authorities.
 */
export class GrantedAuthoritiesUiModelMapper extends Mapper<AuthorityList> {
  /**
   * Transforms a list of authority identifiers into a UI AuthorityList  model.
   *
   * @param data - An array of authority identifiers (string codes) to map.
   *               May include suffix-delimited entries for repository GraphQL rights.
   * @returns An AuthorityList containing unique authority codes, including derived GraphQL UI authorities.
   */
  mapToModel(data: string[]): AuthorityList {
    const result: string[] = [];
    const authorities = data ?? [];
    for (const auth of authorities) {
      if (auth.includes(Authority.SUFFIX_DELIMITER)) {
        // For example: "READ_REPO_ABC:GRAPHQL" or "WRITE_REPO_ABC:GRAPHQL"
        const [oldAuth, suffix] = auth.split(Authority.SUFFIX_DELIMITER);
        const hasRepoRights = oldAuth.startsWith(Authority.READ_REPO_PREFIX) || oldAuth.startsWith(Authority.WRITE_REPO_PREFIX);
        if (hasRepoRights && suffix === Authority.GRAPHQL) {
          // Use the helper to extract the repository id.
          const repoData = this.getRepoFromAuthority(oldAuth);
          if (repoData) {
            const { repo } = repoData;
            const uiAuth = Authority.GRAPHQL_PREFIX + repo;
            if (!result.includes(oldAuth)) {
              result.push(oldAuth);
            }
            if (!result.includes(uiAuth)) {
              result.push(uiAuth);
            }
            continue;
          }
        }
      }
      if (!result.includes(auth)) {
        result.push(auth);
      }
    }

    return new AuthorityList(result);
  }

  private readonly getRepoFromAuthority = (role: string) => {
    if (role.startsWith(Authority.READ_REPO_PREFIX)) {
      return { prefix: Authority.READ_REPO_PREFIX, repo: role.substring(Authority.READ_REPO_PREFIX.length) };
    }
    if (role.startsWith(Authority.WRITE_REPO_PREFIX)) {
      return { prefix: Authority.WRITE_REPO_PREFIX, repo: role.substring(Authority.WRITE_REPO_PREFIX.length) };
    }
    if (role.startsWith(Authority.GRAPHQL_PREFIX)) {
      return { prefix: Authority.GRAPHQL_PREFIX, repo: role.substring(Authority.GRAPHQL_PREFIX.length) };
    }
    return null;
  };
}
