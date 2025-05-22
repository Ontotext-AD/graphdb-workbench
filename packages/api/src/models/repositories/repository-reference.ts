/**
 * Represents a reference to a repository identified by an ID and location.
 */
export interface RepositoryReference {
  /**
   * Gets the unique identifier of the repository.
   * @returns {string} The repository ID.
   */
  get id(): string;
  
  /**
   * Gets the location of the repository.
   * @returns {string} The repository location.
   */
  get location(): string;
}
