import {Model} from '../common';
import {AppSettings} from '../users/app-settings';
import {AuthorityList} from './authorization/authority-list';

/**
 * Represents an authentication setting.
 */
export class AuthSettings extends Model<AuthSettings> {
  appSettings?: AppSettings;
  authorities: AuthorityList;
  enabled?: boolean;

  constructor(data: Partial<AuthSettings> = {}) {
    super();
    this.appSettings = data.appSettings ?? new AppSettings();
    this.authorities = data.authorities ?? new AuthorityList();
    this.enabled = data.enabled;
  }
}
