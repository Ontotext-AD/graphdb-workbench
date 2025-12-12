import {UsersService} from '../users.service';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {User} from '../../../models/users/user';
import {AuthorityList, Authority} from '../../../models/security';
import {AppSettings} from '../../../models/users/app-settings';
import {UserResponse} from '../response/user-response';

describe('UsersService', () => {
  let service: UsersService;
  const BASE_URL = 'rest/security/users';

  beforeEach(() => {
    service = new UsersService();
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  describe('getUser', () => {
    it('should fetch and map a user by username', async () => {
      const now = Date.now();
      const mockResponse: UserResponse = {
        username: 'alice',
        password: '',
        grantedAuthorities: ['ROLE_USER', 'READ_REPO_repo1'],
        appSettings: {
          DEFAULT_INFERENCE: true,
          DEFAULT_SAMEAS: false,
          EXECUTE_COUNT: true,
        },
        dateCreated: now,
        gptThreads: ['thread-1', 'thread-2'],
        external: false,
      };

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/alice`)
          .setResponse(mockResponse)
          .setStatus(200)
      );

      const user = await service.getUser('alice');

      expect(user).toBeInstanceOf(User);
      expect(user.username).toBe('alice');
      expect(user.authorities).toBeInstanceOf(AuthorityList);
      expect(user.authorities.getItems()).toEqual(['ROLE_USER', 'READ_REPO_repo1']);
      expect(user.appSettings).toBeInstanceOf(AppSettings);
      expect(user.appSettings.DEFAULT_INFERENCE).toBe(true);
      expect(user.gptThreads).toEqual(['thread-1', 'thread-2']);
      expect(user.external).toBe(false);
      expect(user.dateCreated).toBeInstanceOf(Date);
      expect(user.dateCreated!.getTime()).toBe(now);
    });
  });

  describe('getUsers', () => {
    it('should fetch and map all users', async () => {
      const mockResponse: UserResponse[] = [
        {
          username: 'alice',
          password: '',
          grantedAuthorities: ['ROLE_USER'],
          appSettings: { DEFAULT_INFERENCE: true },
          dateCreated: Date.now(),
          gptThreads: [],
          external: false,
        },
        {
          username: 'bob',
          password: '',
          grantedAuthorities: ['ROLE_ADMIN'],
          appSettings: { DEFAULT_INFERENCE: false },
          dateCreated: Date.now(),
          gptThreads: ['thread-1', 'thread-2'],
          external: true,
        },
      ];

      TestUtil.mockResponse(
        new ResponseMock(BASE_URL)
          .setResponse(mockResponse)
          .setStatus(200)
      );

      const users = await service.getUsers();

      expect(users).toHaveLength(2);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[0].username).toBe('alice');
      expect(users[0].authorities.getItems()).toEqual(['ROLE_USER']);
      expect(users[1]).toBeInstanceOf(User);
      expect(users[1].username).toBe('bob');
      expect(users[1].authorities.getItems()).toEqual(['ROLE_ADMIN']);
      expect(users[1].external).toBe(true);
    });

    it('should handle empty users list', async () => {
      TestUtil.mockResponse(
        new ResponseMock(BASE_URL)
          .setResponse([])
          .setStatus(200)
      );

      const users = await service.getUsers();

      expect(users).toEqual([]);
      expect(users).toHaveLength(0);
    });
  });

  describe('getAdminUser', () => {
    it('should fetch and map the admin user', async () => {
      const mockResponse: UserResponse = {
        username: 'admin',
        password: '',
        grantedAuthorities: ['ROLE_ADMIN'],
        appSettings: {
          DEFAULT_INFERENCE: true,
          DEFAULT_SAMEAS: true,
          EXECUTE_COUNT: true,
        },
        dateCreated: Date.now(),
        gptThreads: [],
        external: false,
      };

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/admin`)
          .setResponse(mockResponse)
          .setStatus(200)
      );

      const adminUser = await service.getAdminUser();

      expect(adminUser).toBeInstanceOf(User);
      expect(adminUser.username).toBe('admin');
      expect(adminUser.authorities.getItems()).toEqual(['ROLE_ADMIN']);
    });
  });

  describe('createUser', () => {
    it('should create a user by mapping and sending request', async () => {
      const user = new User({
        username: 'newuser',
        password: 'secret123',
        authorities: new AuthorityList(['ROLE_USER']),
        appSettings: new AppSettings({ DEFAULT_INFERENCE: false }),
      });

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/newuser`)
          .setStatus(201)
      );

      await service.createUser(user);

      const request = TestUtil.getRequest(`${BASE_URL}/newuser`);
      expect(request).toBeDefined();
      expect(request?.method).toBe('POST');

      // Verify request body
      const body = JSON.parse(request?.body as string);
      expect(body.password).toBe('secret123');
      expect(body.grantedAuthorities).toEqual(['ROLE_USER']);
      expect(body.appSettings).toEqual({
        DEFAULT_VIS_GRAPH_SCHEMA: true,
        DEFAULT_INFERENCE: false,
        DEFAULT_SAMEAS: true,
        IGNORE_SHARED_QUERIES: false,
        EXECUTE_COUNT: true,
      });
    });

    it('should map user with multiple authorities correctly', async () => {
      const user = new User({
        username: 'testuser',
        password: 'pass',
        authorities: new AuthorityList([Authority.ROLE_ADMIN, Authority.ROLE_REPO_MANAGER]),
        appSettings: new AppSettings(),
      });

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/testuser`)
          .setStatus(201)
      );

      await service.createUser(user);

      const request = TestUtil.getRequest(`${BASE_URL}/testuser`);
      expect(request).toBeDefined();

      // Verify request body with multiple authorities
      const body = JSON.parse(request?.body as string);
      expect(body.password).toBe('pass');
      expect(body.grantedAuthorities).toEqual([Authority.ROLE_ADMIN, Authority.ROLE_REPO_MANAGER]);
    });
  });

  describe('updateUser', () => {
    it('should update a user by mapping and sending request', async () => {
      const user = new User({
        username: 'alice',
        password: 'newpassword',
        authorities: new AuthorityList(['ROLE_ADMIN']),
        appSettings: new AppSettings({ DEFAULT_INFERENCE: true }),
      });

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/alice`)
          .setStatus(200)
      );

      await service.updateUser(user);

      const request = TestUtil.getRequest(`${BASE_URL}/alice`);
      expect(request).toBeDefined();
      expect(request?.method).toBe('PUT');

      // Verify request body
      const body = JSON.parse(request?.body as string);
      expect(body.password).toBe('newpassword');
      expect(body.grantedAuthorities).toEqual(['ROLE_ADMIN']);
      expect(body.appSettings).toEqual({
        DEFAULT_VIS_GRAPH_SCHEMA: true,
        DEFAULT_INFERENCE: true,
        DEFAULT_SAMEAS: true,
        IGNORE_SHARED_QUERIES: false,
        EXECUTE_COUNT: true,
      });
    });
  });

  describe('updateCurrentUser', () => {
    it('should update current user using PATCH', async () => {
      const user = new User({
        username: 'alice',
        authorities: new AuthorityList(['ROLE_USER']),
        appSettings: new AppSettings({
          DEFAULT_INFERENCE: false,
          EXECUTE_COUNT: false,
        }),
      });

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/alice`)
          .setStatus(200)
      );

      await service.updateCurrentUser(user);

      const request = TestUtil.getRequest(`${BASE_URL}/alice`);
      expect(request).toBeDefined();
      expect(request?.method).toBe('PATCH');

      // Verify request body
      const body = JSON.parse(request?.body as string);
      expect(body.password).toBeUndefined();
      expect(body.grantedAuthorities).toEqual(['ROLE_USER']);
      expect(body.appSettings).toEqual({
        DEFAULT_VIS_GRAPH_SCHEMA: true,
        DEFAULT_INFERENCE: false,
        DEFAULT_SAMEAS: true,
        IGNORE_SHARED_QUERIES: false,
        EXECUTE_COUNT: false,
      });
    });

    it('should update user without password', async () => {
      const user = new User({
        username: 'bob',
        authorities: new AuthorityList(['ROLE_USER']),
        appSettings: new AppSettings({ EXECUTE_COUNT: true }),
      });

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/bob`)
          .setStatus(200)
      );

      await service.updateCurrentUser(user);

      const request = TestUtil.getRequest(`${BASE_URL}/bob`);
      expect(request).toBeDefined();

      // Verify request body
      const body = JSON.parse(request?.body as string);
      expect(body.password).toBeUndefined();
      expect(body.grantedAuthorities).toEqual(['ROLE_USER']);
      expect(body.appSettings.EXECUTE_COUNT).toBe(true);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by username', async () => {
      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/bob`)
          .setStatus(204)
      );

      await service.deleteUser('bob');

      const request = TestUtil.getRequest(`${BASE_URL}/bob`);
      expect(request).toBeDefined();
      expect(request?.method).toBe('DELETE');
    });

    it('should handle special characters in username when deleting', async () => {
      const username = 'user@test.com';
      const encodedUsername = 'user%40test.com';

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/${encodedUsername}`)
          .setStatus(204)
      );

      await service.deleteUser(username);

      const request = TestUtil.getRequest(`${BASE_URL}/${encodedUsername}`);
      expect(request).toBeDefined();
    });
  });
});

