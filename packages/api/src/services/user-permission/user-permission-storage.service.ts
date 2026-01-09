import {LocalStorageService} from '../storage/local-storage.service';

export class UserPermissionStorageService extends LocalStorageService {
  readonly NAMESPACE = 'auth';

  set(key: string, value: string): void {
    this.storeValue(key, value);
  }
}
