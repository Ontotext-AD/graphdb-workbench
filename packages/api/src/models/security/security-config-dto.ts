import {AuthSettingsDto} from './auth-settings-dto';
import {AuthSettings} from './auth-settings';

export interface SecurityConfigDto {
  authImplementation?: string;
  enabled?: boolean;
  passwordLoginEnabled?: boolean;
  freeAccess?: AuthSettingsDto;
  overrideAuth?: AuthSettingsDto;
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
