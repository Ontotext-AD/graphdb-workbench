import {Service} from '../../providers/service/service';
import {MapperProvider, service} from '../../providers';
import {User} from '../../models/users/user';
import {UsersRestService} from './users-rest.service';
import {UserResponseMapper} from './user-response.mapper';
import {UserRequestMapper} from './user-request.mapper';

export class UsersService implements Service {
  static readonly ADMIN_USERNAME = 'admin';
  private readonly usersRestService  = service(UsersRestService);
  private readonly userResponseMapper = MapperProvider.get(UserResponseMapper);
  private readonly userRequestMapper = MapperProvider.get(UserRequestMapper);

  /**
   * Retrieves a user by username from the backend.
   * The full response is mapped to convert its data property to a UI model.
   *
   * @param username - The username of the user to retrieve.
   * @returns A promise that resolves to the User model.
   */
  getUser(username: string): Promise<User> {
    return this.usersRestService.getUser(username)
      .then((response) => this.userResponseMapper.mapToModel(response));
  }

  /**
   * Retrieves all users from the backend.
   * Each user in the response is mapped to convert its data property to a UI model.
   *
   * @returns A promise that resolves to an array of User models.
   */
  getUsers(): Promise<User[]> {
    return this.usersRestService.getUsers()
      .then((response) => {
        return response.map((user) => this.userResponseMapper.mapToModel(user));
      });
  }

  /**
   * Retrieves the admin user from the backend.
   * The full response is mapped to convert its data property to a UI model.
   *
   * @returns A promise that resolves to the User model of the admin user.
   */
  getAdminUser(): Promise<User> {
    return this.usersRestService.getUser(UsersService.ADMIN_USERNAME)
      .then((response) => this.userResponseMapper.mapToModel(response));
  }

  /**
   * Creates a new user in the backend.
   * The user data is mapped to the appropriate request format before sending.
   * @param user
   */
  createUser(user: User): Promise<void> {
    const userRequest = this.userRequestMapper.mapToModel(user);
    return this.usersRestService.createUser(user.username, userRequest);
  }

  /**
   * Updates an existing user in the backend.
   * The user data is mapped to the appropriate request format before sending.
   * @param user
   */
  updateUser(user: User): Promise<void> {
    const userRequest = this.userRequestMapper.mapToModel(user);
    return this.usersRestService.updateUser(user.username, userRequest);
  }

  /**
   * Deletes a user from the backend by username.
   * @param username
   */
  deleteUser(username: string): Promise<void> {
    return this.usersRestService.deleteUser(username);
  }

  updateCurrentUser(user: User): Promise<void> {
    const userRequest = this.userRequestMapper.mapToModel(user);
    return this.usersRestService.updateCurrentUser(user.username, userRequest);
  }
}
