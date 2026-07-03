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

/**
 * Returns a repository identifier qualified by its location.
 *
 * @param {RepositoryReference} repository The repository reference.
 * @returns {string} The qualified repository identifier in the format `<id>@<location>`, or `<id>` if the location is not available.
 */
export const getRepositoryIdWithLocation = (repository: RepositoryReference): string => {
  return repository.location ? `${repository.id}@${repository.location}` : repository.id;
};
