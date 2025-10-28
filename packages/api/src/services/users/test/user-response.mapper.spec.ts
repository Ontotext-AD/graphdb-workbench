import {UserResponseMapper} from '../user-response.mapper';
import {User} from '../../../models/users/user';
import {AuthorityList} from '../../../models/security';
import {AppSettings} from '../../../models/users/app-settings';
import {UserResponse} from '../../../models/users/response-models/user-response';

describe('UserResponseMapper', () => {
  it('maps UserResponse to User correctly', () => {
    const now = Date.now();

    const data = {
      username: 'alice',
      password: 'pwd',
      grantedAuthorities: ['ROLE_USER', 'READ_REPO_repo1'],
      appSettings: {
        DEFAULT_INFERENCE: false,
        DEFAULT_VIS_GRAPH_SCHEMA: true,
      },
      dateCreated: now,
      gptThreads: ['thread-1', 'thread-2'],
      external: true,
    } as UserResponse;

    const mapper = new UserResponseMapper();
    const user = mapper.mapToModel(data);

    expect(user).toBeInstanceOf(User);
    expect(user.username).toBe('alice');

    // Authorities mapped to AuthorityList
    expect(user.authorities).toBeInstanceOf(AuthorityList);
    expect(user.authorities.getItems()).toEqual(data.grantedAuthorities);

    // AppSettings mapped and values preserved
    expect(user.appSettings).toBeInstanceOf(AppSettings);
    expect(user.appSettings.DEFAULT_INFERENCE).toBe(false);
    expect(user.appSettings.DEFAULT_VIS_GRAPH_SCHEMA).toBe(true);

    // Date conversion
    expect(user.dateCreated).toBeInstanceOf(Date);
    expect(user.dateCreated!.getTime()).toBe(now);

    // Other fields
    expect(user.gptThreads).toEqual(data.gptThreads);
    expect(user.external).toBe(true);
  });
});

