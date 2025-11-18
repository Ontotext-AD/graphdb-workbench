import {AuthorityList} from './authorization/authority-list';
import {AppSettings} from '../users';

export interface AuthenticatedUserInit {
  external?: boolean;
  username?: string;
  password?: string;
  authorities?: AuthorityList;
  grantedAuthoritiesUiModel?: AuthorityList;
  appSettings?: AppSettings;
}
