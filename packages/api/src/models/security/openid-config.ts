import {Model} from '../common';

export class OpenIdConfig extends Model<OpenIdConfig> {
  openIdKeys?: Record<string, JsonWebKey>;
  openIdTokenUrl?: string;
  openIdKeysUri?: string;
  openIdEndSessionUrl?: string;
  supportsOfflineAccess?: boolean;

  constructor(config: Partial<OpenIdConfig>) {
    super();
    this.openIdKeys = config.openIdKeys;
    this.openIdTokenUrl = config.openIdTokenUrl;
    this.openIdKeysUri = config.openIdKeysUri;
    this.openIdEndSessionUrl = config.openIdEndSessionUrl;
    this.supportsOfflineAccess = config.supportsOfflineAccess;
  }
}
