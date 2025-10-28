import {UsersRestService} from '../users-rest.service';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {UserResponse} from '../../../models/users/response-models/user-response';
import {UserRequest} from '../../../models/users/response-models/user-request';

describe('UsersRestService', () => {
  let service: UsersRestService;
  const BASE_URL = 'rest/security/users';

  beforeEach(() => {
    service = new UsersRestService();
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  describe('getUser', () => {
    it('should fetch a single user by username', async () => {
      const username = 'alice';
      const mockUserResponse: UserResponse = {
        username: 'alice',
        password: '',
        grantedAuthorities: ['ROLE_USER'],
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
        new ResponseMock(`${BASE_URL}/alice`)
          .setResponse(mockUserResponse)
          .setStatus(200)
      );

      const result = await service.getUser(username);

      expect(result).toEqual(mockUserResponse);
      expect(result.username).toBe('alice');
    });

    it('should encode special characters in username', async () => {
      const username = 'user@example.com';
      const encodedUsername = 'user%40example.com';
      const mockUserResponse: UserResponse = {
        username: 'user@example.com',
        password: '',
        grantedAuthorities: ['ROLE_USER'],
        appSettings: {
          DEFAULT_INFERENCE: true,
        },
        dateCreated: Date.now(),
        gptThreads: [],
        external: false,
      };

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/${encodedUsername}`)
          .setResponse(mockUserResponse)
          .setStatus(200)
      );

      const result = await service.getUser(username);

      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('getUsers', () => {
    it('should fetch all users', async () => {
      const mockUsersResponse: UserResponse[] = [
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
          gptThreads: ['thread-1'],
          external: true,
        },
      ];

      TestUtil.mockResponse(
        new ResponseMock(BASE_URL)
          .setResponse(mockUsersResponse)
          .setStatus(200)
      );

      const result = await service.getUsers();

      expect(result).toEqual(mockUsersResponse);
      expect(result).toHaveLength(2);
      expect(result[0].username).toBe('alice');
      expect(result[1].username).toBe('bob');
    });

    it('should handle empty users list', async () => {
      TestUtil.mockResponse(
        new ResponseMock(BASE_URL)
          .setResponse([])
          .setStatus(200)
      );

      const result = await service.getUsers();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const username = 'newuser';
      const userRequest: UserRequest = new UserRequest({
        password: 'secret123',
        grantedAuthorities: ['ROLE_USER'],
        appSettings: {
          DEFAULT_INFERENCE: false,
        },
      });

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/newuser`)
          .setStatus(201)
      );

      await service.createUser(username, userRequest);

      const request = TestUtil.getRequest(`${BASE_URL}/newuser`);
      expect(request).toBeDefined();
      expect(request?.method).toBe('POST');
    });

    it('should encode special characters in username when creating', async () => {
      const username = 'new!user';
      const encodedUsername = 'new%21user';
      const userRequest: UserRequest = new UserRequest({
        password: 'secret',
        grantedAuthorities: ['ROLE_USER'],
      });

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/${encodedUsername}`)
          .setStatus(201)
      );

      await service.createUser(username, userRequest);

      const request = TestUtil.getRequest(`${BASE_URL}/${encodedUsername}`);
      expect(request).toBeDefined();
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const username = 'alice';
      const userRequest: UserRequest = new UserRequest({
        password: 'newpassword',
        grantedAuthorities: ['ROLE_ADMIN'],
        appSettings: {
          DEFAULT_INFERENCE: true,
        },
      });

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/alice`)
          .setStatus(200)
      );

      await service.updateUser(username, userRequest);

      const request = TestUtil.getRequest(`${BASE_URL}/alice`);
      expect(request).toBeDefined();
      expect(request?.method).toBe('PUT');
    });
  });

  describe('updateCurrentUser', () => {
    it('should update the current user with PATCH', async () => {
      const username = 'alice';
      const userRequest: UserRequest = new UserRequest({
        appSettings: {
          DEFAULT_INFERENCE: false,
          EXECUTE_COUNT: false,
        },
      });

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/alice`)
          .setStatus(200)
      );

      await service.updateCurrentUser(username, userRequest);

      const request = TestUtil.getRequest(`${BASE_URL}/alice`);
      expect(request).toBeDefined();
      expect(request?.method).toBe('PATCH');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const username = 'bob';

      TestUtil.mockResponse(
        new ResponseMock(`${BASE_URL}/bob`)
          .setStatus(204)
      );

      await service.deleteUser(username);

      const request = TestUtil.getRequest(`${BASE_URL}/bob`);
      expect(request).toBeDefined();
      expect(request?.method).toBe('DELETE');
    });

    it('should encode special characters in username when deleting', async () => {
      const username = 'user(test)';
      const encodedUsername = 'user%28test%29';

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

