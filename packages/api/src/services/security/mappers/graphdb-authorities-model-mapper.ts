import {Mapper} from '../../../providers/mapper/mapper';
import {GraphdbAuthoritiesModel} from '../../../models/security/authorization/graphdb-authorities-model';
import {Authority, AuthorityList} from '../../../models/security';
import {AuthoritiesUtil} from '../utils/authorities-util';

export class GraphdbAuthoritiesModelMapper extends Mapper<GraphdbAuthoritiesModel> {
  private readonly GRAPHQL_SUFFIX_WITH_DELIMITER = Authority.SUFFIX_DELIMITER + Authority.GRAPHQL;

  mapToModel(authorityList: AuthorityList): GraphdbAuthoritiesModel {
    const authorities = authorityList.getItems();
    if (!authorities.length) {
      return authorities;
    }

    const customAuthorities: string[] = [];
    const repoMap: Record<string, { read: boolean, write: boolean, graphql: boolean }> = {};
    // Helper to ensure a fresh entry for each repository.
    const getOrCreateRepo = (repoId: string) => {
      if (!repoMap[repoId]) {
        repoMap[repoId] = {read: false, write: false, graphql: false};
      }
      return repoMap[repoId];
    };

    let isReadAll = false;
    let isWriteAll = false;
    let isGraphqlAll = false;
    authorities.forEach((auth) => {
      const repoData = AuthoritiesUtil.getRepoFromAuthority(auth);
      if (repoData) {
        const {prefix, repo} = repoData;
        const entry = getOrCreateRepo(repo);
        if (prefix === Authority.READ_REPO_PREFIX) {
          entry.read = true;
          if (repo === '*') {
            isReadAll = true;
          }
        } else if (prefix === Authority.WRITE_REPO_PREFIX) {
          entry.write = true;
          if (repo === '*') {
            isWriteAll = true;
          }
        } else if (prefix === Authority.GRAPHQL_PREFIX) {
          entry.graphql = true;
          if (repo === '*') {
            isGraphqlAll = true;
          }
        }
      } else {
        customAuthorities.push(auth);
      }
    });

    const graphDBAuthorities: string[] = [];
    Object.keys(repoMap).forEach((repoId) => {
      const perms = repoMap[repoId];
      if (perms.graphql || isGraphqlAll) {
        if (perms.write || isWriteAll) {
          graphDBAuthorities.push(`${Authority.WRITE_REPO_PREFIX}${repoId}${this.GRAPHQL_SUFFIX_WITH_DELIMITER}`);
          graphDBAuthorities.push(`${Authority.READ_REPO_PREFIX}${repoId}${this.GRAPHQL_SUFFIX_WITH_DELIMITER}`);
        } else if (perms.read || isReadAll) {
          graphDBAuthorities.push(`${Authority.READ_REPO_PREFIX}${repoId}${this.GRAPHQL_SUFFIX_WITH_DELIMITER}`);
        }
      } else {
        if (perms.write) {
          graphDBAuthorities.push(`${Authority.WRITE_REPO_PREFIX}${repoId}`);
          graphDBAuthorities.push(`${Authority.READ_REPO_PREFIX}${repoId}`);
        } else if (perms.read) {
          graphDBAuthorities.push(`${Authority.READ_REPO_PREFIX}${repoId}`);
        }
      }
    });

    return [...customAuthorities, ...graphDBAuthorities];
  }
}
