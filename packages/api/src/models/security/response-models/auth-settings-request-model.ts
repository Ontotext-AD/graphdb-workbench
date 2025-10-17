export interface AuthSettingsRequestModel {
  enabled?: boolean;
  authorities?: string[];
  appSettings?: Record<string, unknown>;
}
