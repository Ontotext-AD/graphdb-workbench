import {AuthenticatedUser} from '../authenticated-user';
import {AuthorityList} from '../authority-list';
import {Authority} from '../authority';

describe('AuthenticatedUser', () => {
  const sample = {
    external: false,
    username: 'admin',
    password: 'secret',
    authorities: ['ROLE_USER', 'ROLE_ADMIN'],
    appSettings: { key: 'value' },
  };

  it('should map authorities and grantedAuthoritiesUiModel using mappers', () => {
    const user = new AuthenticatedUser(sample as never);

    expect(user.username).toBe(sample.username);
    expect(user.password).toBe(sample.password);
    expect(user.external).toBe(sample.external);
    expect(user.authorities).toBeInstanceOf(AuthorityList);
    expect(user.grantedAuthoritiesUiModel).toBeInstanceOf(AuthorityList);
    expect(user.authorities.getItems()).toEqual(sample.authorities);
    expect(user.appSettings).toEqual(sample.appSettings);
  });

  it('should default values when no data provided', () => {
    const user = new AuthenticatedUser();

    expect(user.external).toBe(false);
    expect(user.username).toBe('');
    expect(user.password).toBe('');
    expect(user.authorities.getItems()).toEqual([]);
    expect(user.grantedAuthoritiesUiModel.getItems()).toEqual([]);
    expect(user.appSettings).toEqual({});
  });

  it('should map complex authorities to UI model correctly', () => {
    const data = {
      username: 'user1',
      password: 'pass1',
      external: true,
      authorities: [`${Authority.READ_REPO_PREFIX}RepoA${Authority.SUFFIX_DELIMITER}${Authority.GRAPHQL}`, Authority.ROLE_USER],
      appSettings: { foo: 'bar' },
    };
    const user = new AuthenticatedUser(data as never);

    expect(user.authorities.getItems()).toEqual(data.authorities);
    expect(user.grantedAuthoritiesUiModel.getItems()).toContain(`${Authority.GRAPHQL_PREFIX}RepoA`);
    expect(user.grantedAuthoritiesUiModel.getItems()).toContain(Authority.ROLE_USER);
  });
});
