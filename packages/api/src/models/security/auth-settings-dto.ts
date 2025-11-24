import {Authority} from './authority';
import {AppSettings} from './app-settings';
import {AuthorityList} from './authority-list';

export interface AuthSettingsDto {
  appSettings?: AppSettings;
  authorities?: Authority[] | AuthorityList;
  enabled?: boolean;
}

export interface AuthSettingsInit {
  appSettings?: AppSettings;
  authorities: AuthorityList;
  enabled?: boolean;
}
