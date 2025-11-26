import {AuthSettingsResponse} from './auth-settings-response';
import {AuthSettings} from './auth-settings';

export interface SecurityConfigResponse {
  authImplementation?: string;
  enabled?: boolean;
  passwordLoginEnabled?: boolean;
  freeAccess?: AuthSettingsResponse;
  overrideAuth?: AuthSettingsResponse;
  openIdEnabled?: boolean;
  userLoggedIn?: boolean;
  freeAccessActive?: boolean;
  hasExternalAuthUser?: boolean;

  [key: string]: unknown;
}

export interface SecurityConfigInit {
  authImplementation?: string;
  enabled?: boolean;
  passwordLoginEnabled?: boolean;
  freeAccess: AuthSettings;
  overrideAuth: AuthSettings;
  openIdEnabled?: boolean;
  userLoggedIn?: boolean;
  freeAccessActive?: boolean;
  hasExternalAuthUser?: boolean;
}
