/**
 * Represents a user response from the API.
 */
export interface UserResponse {
  username: string;
  password: string;
  grantedAuthorities: string[];
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
  dateCreated: number;
  gptThreads: string[];
  external: boolean;
}
