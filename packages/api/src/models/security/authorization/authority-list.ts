import {ModelList} from '../../common';
import {MapperProvider} from '../../../providers';
import {Authority} from './authority';
import {GraphdbAuthoritiesModelMapper} from '../../../services/security/mappers/graphdb-authorities-model-mapper';
import {GraphdbAuthoritiesModel} from './graphdb-authorities-model';
import {AuthoritiesUiModel} from './authorities-ui-model';
import {RepositoriesPermissions} from './repositories-permissions';
import {GrantedAuthoritiesUiModelMapper} from '../../../services/security/mappers/granted-authorities-ui-model.mapper';
import {AuthoritiesUtil} from '../../../services/security/utils/authorities-util';

/**
 * Represents a list of authorities in an authenticated user.
 */
export class AuthorityList extends ModelList<string> {
  constructor(authorities?: string[]) {
    super(authorities);
  }

  /**
   * Checks if the list contains a specific authority.
   *
   * @param authority - The Authority string to check for in the list.
   * @returns A boolean indicating whether the specified authority is present in the list.
   *          Returns true if the authority is found, false otherwise.
   */
  hasAuthority(authority: string): boolean {
    return this.items.includes(authority);
  }

  /**
   * Gets a list of custom roles from the authority list.
   *
   * @returns An array of strings representing the custom roles.
   */
  getCustomRoles(): string[] {
    return this.getItems().filter(role => role.indexOf(Authority.CUSTOM_PREFIX) === 0);
  }

  /**
   * Converts the AuthorityList to an Authorities UI Model.
   *
   * @returns An AuthoritiesUiModel representing the granted authorities.
   */
  toUIModel(): AuthoritiesUiModel {
    const grantedAuthorities: AuthoritiesUiModel = {
      [Authority.READ_REPO]: {},
      [Authority.WRITE_REPO]: {},
      [Authority.GRAPHQL]: {}
    };

    const uiModel = MapperProvider.get(GrantedAuthoritiesUiModelMapper).mapToModel(this.getItems());
    const auths = uiModel.getItems();
    auths.forEach(role => {
      if (role.startsWith(Authority.READ_REPO_PREFIX) || role.startsWith(Authority.WRITE_REPO_PREFIX) || role.startsWith(Authority.GRAPHQL_PREFIX)) {
        const repoData = AuthoritiesUtil.getRepoFromAuthority(role);
        if (repoData) {
          const {prefix, repo} = repoData;
          if (prefix === Authority.READ_REPO_PREFIX) {
            grantedAuthorities[Authority.READ_REPO][repo] = true;
          } else if (prefix === Authority.WRITE_REPO_PREFIX) {
            grantedAuthorities[Authority.WRITE_REPO][repo] = true;
          } else if (prefix === Authority.GRAPHQL_PREFIX) {
            grantedAuthorities[Authority.GRAPHQL][repo] = true;
          }
        }
      }
    });
    return grantedAuthorities;
  }

  /**
   * Converts the AuthorityList to a GraphDB Authorities Model.
   *
   * @returns A GraphdbAuthoritiesModel representing the authorities in GraphDB format.
   */
  toGraphdbAuthoritiesModel(): GraphdbAuthoritiesModel {
    return MapperProvider.get(GraphdbAuthoritiesModelMapper).mapToModel(this);
  };

  /**
   * Gets the repositories permissions from the authority list.
   *
   * @returns A RepositoriesPermissions object representing the permissions for each repository.
   */
  getRepositoriesPermissions(): RepositoriesPermissions {
    const repositories: RepositoriesPermissions = {};
    const auths = this.getItems();
    for (const authority of auths) {
      const repoData = AuthoritiesUtil.getRepoFromAuthority(authority);
      if (repoData) {
        const {prefix, repo} = repoData;
        const permissions = repositories[repo] ?? {read: false, write: false, graphql: false};
        if (prefix === Authority.READ_REPO_PREFIX) {
          permissions.read = true;
        } else if (prefix === Authority.WRITE_REPO_PREFIX) {
          permissions.write = true;
        } else if (prefix === Authority.GRAPHQL_PREFIX) {
          permissions.graphql = true;
        }
        repositories[repo] = permissions;
      }
    }

    return repositories;
  }
}
