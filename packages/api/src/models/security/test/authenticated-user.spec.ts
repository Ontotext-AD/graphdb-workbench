import {AuthenticatedUser} from '../authenticated-user';
import {AuthorityList} from '../authorization/authority-list';
import {Authority} from '../authorization/authority';
import {AppSettings} from '../../users/app-settings';

describe('AuthenticatedUser', () => {
  const sampleAuthenticatedUser = {
    external: false,
    username: 'admin',
    password: 'secret',
    authorities: new AuthorityList(['ROLE_USER', 'ROLE_ADMIN']),
    appSettings: { key: 'value' },
  };

  it('should map authorities and grantedAuthoritiesUiModel using mappers', () => {
    const user = new AuthenticatedUser(sampleAuthenticatedUser as never);

    expect(user.username).toBe(sampleAuthenticatedUser.username);
    expect(user.password).toBe(sampleAuthenticatedUser.password);
    expect(user.external).toBe(sampleAuthenticatedUser.external);
    expect(user.authorities).toBeInstanceOf(AuthorityList);
    expect(user.grantedAuthoritiesUiModel).toBeInstanceOf(AuthorityList);
    expect(user.authorities.getItems()).toEqual(sampleAuthenticatedUser.authorities.getItems());
    expect(user.appSettings).toEqual(sampleAuthenticatedUser.appSettings);
  });

  it('should default values when no data provided', () => {
    const user = new AuthenticatedUser();

    expect(user.external).toBe(false);
    expect(user.username).toBe('');
    expect(user.password).toBe('');
    expect(user.authorities.getItems()).toEqual([]);
    expect(user.grantedAuthoritiesUiModel.getItems()).toEqual([]);
    expect(user.appSettings).toEqual(new AppSettings());
  });

  it('should map complex authorities to UI model correctly', () => {
    const data = {
      username: 'user1',
      password: 'pass1',
      external: true,
      authorities: new AuthorityList([`${Authority.READ_REPO_PREFIX}RepoA${Authority.SUFFIX_DELIMITER}${Authority.GRAPHQL}`, Authority.ROLE_USER]),
      appSettings: { foo: 'bar' },
    };
    const user = new AuthenticatedUser(data as never);

    expect(user.authorities.getItems()).toEqual(data.authorities.getItems());
    expect(user.grantedAuthoritiesUiModel.getItems()).toContain(`${Authority.GRAPHQL_PREFIX}RepoA`);
    expect(user.grantedAuthoritiesUiModel.getItems()).toContain(Authority.ROLE_USER);
  });
});
