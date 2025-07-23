import {GrantedAuthoritiesUiModelMapper} from '../granted-authorities-ui-model.mapper';
import {Authority} from '../../../../models/security';

describe('GrantedAuthoritiesUiModelMapper', () => {
  const mapper = new GrantedAuthoritiesUiModelMapper();

  it('should add GRAPHQL prefix for repository authorities with suffix', () => {
    const repoAuth = `${Authority.READ_REPO_PREFIX}ABC${Authority.SUFFIX_DELIMITER}${Authority.GRAPHQL}`;
    const data = [repoAuth];
    const result = mapper.mapToModel(data);

    expect(result.getItems().length).toEqual(2);
    expect(result.getItems()).toContain(`${Authority.READ_REPO_PREFIX}ABC`);
    expect(result.getItems()).toContain(`${Authority.GRAPHQL_PREFIX}ABC`);
  });

  it('should handle WRITE_REPO prefix with suffix', () => {
    const auth = `${Authority.WRITE_REPO_PREFIX}Repo1${Authority.SUFFIX_DELIMITER}${Authority.GRAPHQL}`;
    const data = [auth];
    const result = mapper.mapToModel(data);

    expect(result.getItems().length).toEqual(2);
    expect(result.getItems()).toContain(`${Authority.WRITE_REPO_PREFIX}Repo1`);
    expect(result.getItems()).toContain(`${Authority.GRAPHQL_PREFIX}Repo1`);
  });

  it('should not duplicate authorities', () => {
    const auth = Authority.ROLE_USER;
    const data = [auth, auth];
    const result = mapper.mapToModel(data);

    expect(result.getItems().filter(item => item === auth).length).toBe(1);
  });

  it('should include non-repo authorities unchanged', () => {
    const auth = Authority.ROLE_ADMIN;
    const data = [auth];
    const result = mapper.mapToModel(data);

    expect(result.getItems()).toEqual([auth]);
  });

  it('should treat suffix for unknown prefixes unchanged', () => {
    const customAuth = `CUSTOM_VALUE${Authority.SUFFIX_DELIMITER}${Authority.GRAPHQL}`;
    const data = [customAuth];
    const result = mapper.mapToModel(data);

    expect(result.getItems()).toEqual([customAuth]);
  });

  it('should ignore suffixes other than GRAPHQL', () => {
    const auth = `${Authority.READ_REPO_PREFIX}Repo2${Authority.SUFFIX_DELIMITER}OTHER`;
    const data = [auth];
    const result = mapper.mapToModel(data);

    expect(result.getItems()).toEqual([auth]);
  });

  it('should not duplicate GRAPHQL_PREFIX if already present', () => {
    const repoAuth = `${Authority.READ_REPO_PREFIX}Repo3${Authority.SUFFIX_DELIMITER}${Authority.GRAPHQL}`;
    const graphqlAuth = `${Authority.GRAPHQL_PREFIX}Repo3`;
    const data = [repoAuth, graphqlAuth];
    const result = mapper.mapToModel(data);

    expect(result.getItems().filter(item => item === graphqlAuth).length).toBe(1);
  });
});
