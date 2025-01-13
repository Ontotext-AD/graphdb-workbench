import {LocalStorageService} from '../storage';

export class UserPermissionStorageService extends LocalStorageService {
  readonly NAMESPACE = 'auth';

  set(key: string, value: string): void {
    this.storeValue(key, value);
  }
}
