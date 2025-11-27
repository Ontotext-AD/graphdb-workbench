export interface AuthSettingsResponse {
  enabled: boolean;
  authorities: string[];
  appSettings: Record<string, unknown>;
}
