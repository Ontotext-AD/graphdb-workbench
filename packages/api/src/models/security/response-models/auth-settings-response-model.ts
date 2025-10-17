export interface AuthSettingsResponseModel {
  enabled: boolean;
  authorities: string[];
  appSettings: Record<string, unknown>;
}
