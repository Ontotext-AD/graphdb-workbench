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

/**
 * Checks whether two repository references point to the same repository, i.e. have the same ID and location.
 *
 * @param {RepositoryReference} [repository] The first repository reference.
 * @param {RepositoryReference} [otherRepository] The second repository reference.
 * @returns {boolean} `true` if both have the same ID and location, or if both are `undefined`.
 */
export const isSameRepository = (repository?: RepositoryReference, otherRepository?: RepositoryReference): boolean => {
  return repository?.id === otherRepository?.id && repository?.location === otherRepository?.location;
};
