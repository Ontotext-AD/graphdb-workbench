import {HttpService} from '../http/http.service';
import {UserResponse} from './response/user-response';
import {UserRequest} from './response/user-request';

export class UsersRestService extends HttpService {
  private readonly SECURITY_ENDPOINT = 'rest/security';
  private readonly SECURITY_USER_ENDPOINT = `${this.SECURITY_ENDPOINT}/users`;

  getUser(username: string): Promise<UserResponse> {
    return this.get(`${this.SECURITY_USER_ENDPOINT}/${this.encodeURIComponentStrict(username)}`);
  }

  getUsers(): Promise<UserResponse[]> {
    return this.get(`${this.SECURITY_USER_ENDPOINT}`);
  }

  createUser(username: string, userRequest: UserRequest): Promise<void> {
    return this.post(`${this.SECURITY_USER_ENDPOINT}/${this.encodeURIComponentStrict(username)}`, {body: userRequest});
  }

  updateUser(username: string, userRequest: UserRequest): Promise<void> {
    return this.put(`${this.SECURITY_USER_ENDPOINT}/${this.encodeURIComponentStrict(username)}`, {body: userRequest});
  }

  updateCurrentUser(username: string, userRequest: UserRequest): Promise<void> {
    return this.patch(`${this.SECURITY_USER_ENDPOINT}/${this.encodeURIComponentStrict(username)}`, {body: userRequest});
  }

  deleteUser(username: string): Promise<void> {
    return this.delete(`${this.SECURITY_USER_ENDPOINT}/${this.encodeURIComponentStrict(username)}`);
  }
}
