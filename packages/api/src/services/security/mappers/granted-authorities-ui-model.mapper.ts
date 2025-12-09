import {AuthorityList} from '../../../models/security/authorization/authority-list';
import {Authority} from '../../../models/security/authorization/authority';
import {AuthoritiesUtil} from '../utils/authorities-util';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper for converting an array of authority strings into an AuthorityList model.
 *
 * This class handles suffix-delimited authorities (e.g. "READ_REPO_ABC:GRAPHQL"),
 * extracting repository-specific GraphQL rights and including both the base and UI-specific authorities.
 */
export const mapGrantedAuthoritiesResponseToModel: MapperFn<string[] | AuthorityList, AuthorityList> = (data) => {
  if (!data) {
    return new AuthorityList();
  }

  const result: string[] = [];
  const authorities = (data instanceof AuthorityList ? data.getItems() : data) ?? [];
  for (const auth of authorities) {
    if (handleRepoGraphQL(auth, result)) {
      continue;
    }
    if (!result.includes(auth)) {
      result.push(auth);
    }
  }

  return new AuthorityList(result);
};

/**
 * Checks whether a given authority string has the ":GRAPHQL" suffix
 * and appropriate repository rights, and if so adds both the base
 * authority and its UI‑specific GraphQL variant.
 * Returns true if this authority was processed here; false otherwise.
 */
function handleRepoGraphQL(auth: string, result: string[]): boolean {
  if (!auth.includes(Authority.SUFFIX_DELIMITER)) {
    return false;
  }
  // For example: "READ_REPO_ABC:GRAPHQL" or "WRITE_REPO_ABC:GRAPHQL"
  const [oldAuth, suffix] = auth.split(Authority.SUFFIX_DELIMITER);
  const hasRepoRights = oldAuth.startsWith(Authority.READ_REPO_PREFIX) || oldAuth.startsWith(Authority.WRITE_REPO_PREFIX);
  if (!hasRepoRights || suffix !== Authority.GRAPHQL) {
    return false;
  }
  // Use the helper to extract the repository id.
  const repoData = AuthoritiesUtil.getRepoFromAuthority(oldAuth);
  if (!repoData) {
    return false;
  }

  const {repo} = repoData;
  const uiAuth = Authority.GRAPHQL_PREFIX + repo;
  if (!result.includes(oldAuth)) {
    result.push(oldAuth);
  }
  if (!result.includes(uiAuth)) {
    result.push(uiAuth);
  }
  return true;
}
