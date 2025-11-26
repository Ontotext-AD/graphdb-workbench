import {Authority} from './authority';
import {AuthorityList} from './authority-list';
import {AppSettings} from './app-settings';

export interface AuthenticatedUserResponse {
  external?: boolean;
  username?: string;
  password?: string;
  authorities?: Authority[] | AuthorityList;
  appSettings?: AppSettings;
}

export interface AuthenticatedUserInit {
  external?: boolean;
  username?: string;
  password?: string;
  authorities?: AuthorityList;
  appSettings?: AppSettings;
}
