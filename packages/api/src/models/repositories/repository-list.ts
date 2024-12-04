import {Repository} from './repository';
import {Copyable} from '../common/copyable';

const REPOSITORY_LOCATION_ID_COMPARATOR = (r1: Repository, r2: Repository) => {
  // Compare locations.
  const locationComparison = r1.location.localeCompare(r2.location);
  if (locationComparison !== 0) {
    // If locations are different, return their comparison.
    return locationComparison;
  }

  // If locations are the same, compare by id.
  return r1.id.localeCompare(r2.id);
};

/**
 * Holds an array of repositories ({@link Repository}) and provides functions to manipulate them.
 */
export class RepositoryList implements Copyable<RepositoryList> {
  repositories: Repository[];

  constructor(repositories?: Repository[]) {
    this.repositories = repositories ?? [];
  }

  /**
   * Finds a repository in the list by its ID and location.
   *
   * @param repositoryId - The unique ID of the repository to find.
   * @param location - The location associated with the repository.
   * @returns The matching {@link Repository} if found, otherwise `undefined`.
   */
  findRepository(repositoryId: string, location: string): Repository | undefined {
    return this.repositories.find(
      (repository) => repository.id === repositoryId && repository.location === location
    );
  }

  /**
   * Sorts the repositories in place by their location and ID.
   *
   * Sorting is performed using the {@link REPOSITORY_LOCATION_ID_COMPARATOR}.
   */
  sortByLocationAndId(): void {
    this.repositories.sort(REPOSITORY_LOCATION_ID_COMPARATOR);
  }

  /**
   * Filters the list of repositories by excluding those with the specified ID(s).
   *
   * @param repositoryIds - An array of repository IDs to exclude from the filtered result.
   * @returns An array of {@link Repository} objects that do not have any of the specified IDs.
   */
  filterByIds(repositoryIds: string[]): Repository[] {
    return this.repositories.filter(
      (repository: Repository) => !repositoryIds.includes(repository.id)
    );
  }

  /**
   * Creates a deep copy of the current {@link RepositoryList}.
   *
   * Each {@link Repository} in the list is also copied to ensure immutability.
   *
   * @returns A new {@link RepositoryList} instance containing copies of the current repositories.
   */
  copy(): RepositoryList {
    return new RepositoryList(this.repositories.map((repository) => repository.copy()));
  }
}
