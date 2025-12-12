/**
 * UserRequest class represents a request to create or update a user.
 */
export class UserRequest {
  password?: string;
  grantedAuthorities?: string[];
  appSettings: {
    DEFAULT_VIS_GRAPH_SCHEMA?: boolean;
    DEFAULT_INFERENCE?: boolean;
    DEFAULT_SAMEAS?: boolean;
    IGNORE_SHARED_QUERIES?: boolean;
    EXECUTE_COUNT?: boolean;
    COOKIE_CONSENT?: boolean | {
      policyAccepted: boolean;
      statistic: boolean;
      thirdParty: boolean;
      updatedAt: number;
    };
  };

  constructor(data?: Partial<UserRequest>) {
    this.password = data?.password;
    this.grantedAuthorities = data?.grantedAuthorities ?? [];
    this.appSettings = data?.appSettings ?? {
      DEFAULT_SAMEAS: true,
      DEFAULT_INFERENCE: true,
      EXECUTE_COUNT: true,
      IGNORE_SHARED_QUERIES: false,
      DEFAULT_VIS_GRAPH_SCHEMA: true,
    };
  }
}
