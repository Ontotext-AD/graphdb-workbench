import {Repository} from '../../models/repositories';
import {RepositoryList} from '../../models/repositories';
import {Mapper} from '../mapper';

/**
 * A class containing functions to map various server responses to specific repository models.
 */
export class RepositoryMapper extends Mapper {

  /**
   * Internal utility to determine whether the provided data is a valid representation of a `Repository` object.
   *
   * This method is primarily used to work around the restriction on using `any` types in TypeScript.
   * It acts as a type guard, ensuring that the `data` parameter can be safely treated as a `Repository`
   * in the context of this class. While it currently always returns `true`, it can be expanded
   * with validation logic if needed in the future.
   *
   * **Note:** This method is intended for internal use only to address linting issues and should not
   * be considered a full validation mechanism.
   *
   * @param {unknown} data - The input data to validate.
   * @returns {data is Repository} - Always returns `true`, marking the data as a `Repository` type.
   */
  private static isRepositoryResponse(data: unknown): data is Repository {
    return true;
  }

  /**
   * Converts raw data into a single repository instance.
   *
   * @param data - The raw repository data from the server.
   * @returns A {@link Repository} instance created from the provided data.
   */
  static toRepository(data: unknown): Repository {
    return this.isRepositoryResponse(data) ? new Repository(data) : new Repository();
  }

  /**
   * Converts server response data into a {@link RepositoryList} model.
   *
   * This method processes a record where the keys represent location URLs, and the values
   * are arrays of repository data. It flattens the data into a single list of {@link Repository} instances
   * and creates an instance of the {@link RepositoryList} class with them.
   *
   * @param data - The raw server response containing repositories grouped by location.
   * @returns A flat list of {@link Repository} instances wrapped in a {@link RepositoryList} model.
   */
  static toRepositoryList(data: Record<string, []>): RepositoryList {
    if (!data) {
      return new RepositoryList();
    }

    const repositories: Repository[] = [];
    Object.entries(data).forEach(([, repositoriesData]) => {
      repositoriesData.forEach((repositoryData) => {
        repositories.push(this.toRepository(repositoryData));
      });
    });
    return new RepositoryList(repositories);
  }
}
