/**
 * Response model for an authenticated user.
 */
export interface AuthenticatedUserResponse {
  username: string;
  password: string;
  authorities: string[];
  appSettings: Record<string, unknown>;
  external: boolean;
}
