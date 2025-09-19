import {AuthStrategyType} from './auth-strategy-type';

/**
 * Interface for authentication strategies.
 *
 * Each authentication strategy implements this interface to provide a self-contained mechanism for authentication.
 * This design allows the security module to remain flexible and extensible, avoiding entangled logic.
 */
export interface AuthStrategy {
  /**
   * The type of authentication strategy.
   */
  type: AuthStrategyType;

  /**
   * Initializes the authentication strategy.
   * Can be used to perform setup tasks such as loading configuration or establishing connections.
   */
  initialize(): Promise<unknown>;

  /**
   * Authenticates a user with the provided login data.
   * @param loginData - The data required for authentication (varies by strategy).
   */
  login(loginData: unknown): Promise<void>;

  /**
   * Logs out the currently authenticated user.
   * @returns A promise that resolves when logout is complete.
   */
  logout(): Promise<void>;

  /**
   * Checks if a user is currently authenticated.
   * @returns True if a user is authenticated, false otherwise.
   */
  isAuthenticated(): boolean;
}
