import {Repository} from './repository';
import {ModelList} from '../common';

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
export class RepositoryList extends ModelList<Repository> {

  constructor(repositories?: Repository[]) {
    super(repositories);
  }

  /**
   * Finds a repository in the list by its ID and location.
   *
   * @param repositoryId - The unique ID of the repository to find.
   * @param location - The location associated with the repository.
   * @param ignoringLocation - If true, the location will be ignored when searching for the repository. Defaults to false.
   * @returns The matching {@link Repository} if found, otherwise `undefined`.
   */
  findRepository(repositoryId: string, location: string, ignoringLocation = false): Repository | undefined {
    return super.find((repository) => repository.id === repositoryId && (ignoringLocation || repository.location === location));
  }

  /**
   * Sorts the repositories in place by their location and ID.
   */
  sortByLocationAndId(): void {
    super.sort(REPOSITORY_LOCATION_ID_COMPARATOR);
  }

  /**
   * Filters the list of repositories by excluding those with the specified ID(s) and LOCATION.
   *
   * @param repositories - An array of repositories to exclude from the filtered result.
   * @returns An array of {@link Repository} objects that do not have any of the specified IDs.
   */
  filterByRepository(repositories: Repository[]): Repository[] {
    return super.filter(this.createIdLocationFilter(repositories));
  }

  /**
   * Creates a filter function to include only objects with matching `id` and `location`.
   *
   * @param itemsToMatch - An array of objects with `id` and `location` to filter by.
   * @returns A filter function that returns `true` for objects with `id` and `location` matching any of the provided objects.
   */
  private createIdLocationFilter<T extends { id: string | number; location: string | number }>(
    itemsToMatch: { id: string | number; location: string | number }[]
  ): (item: T) => boolean {
    return (item: T) =>
      itemsToMatch.some(match => match.id !== item.id || match.location !== item.location);
  }
}
