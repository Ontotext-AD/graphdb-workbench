import {Model} from '../common';
import {AppSettings} from '../users/app-settings';
import {AuthorityList} from './authorization/authority-list';
import {mapAuthorityListResponseToModel} from '../../services/security/mappers/authority-list.mapper';

/**
 * Represents an authentication setting.
 */
export class AuthSettings extends Model<AuthSettings> {
  appSettings?: AppSettings;
  authorities: AuthorityList;
  enabled?: boolean;

  constructor(data: Partial<AuthSettings>) {
    super();
    this.appSettings = data.appSettings;
    if (data.authorities instanceof AuthorityList) {
      this.authorities = data.authorities;
    } else {
      this.authorities = mapAuthorityListResponseToModel(data.authorities ?? []);
    }
    this.enabled = data.enabled;
  }
}
