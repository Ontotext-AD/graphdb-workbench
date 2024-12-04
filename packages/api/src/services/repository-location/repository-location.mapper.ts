import {RepositoryLocation} from '../../models/repository-location';
import {Mapper} from '../mapper';

/**
 * A class containing functions to map various server responses to specific repository location models.
 */
export class RepositoryLocationMapper extends Mapper {

  /**
   * Internal utility to determine whether the provided data is a valid representation of a `RepositoryLocation` object.
   *
   * This method is primarily used to work around the restriction on using `any` types in TypeScript.
   * It acts as a type guard, ensuring that the `data` parameter can be safely treated as a `RepositoryLocation`
   * in the context of this class. While it currently always returns `true`, it can be expanded
   * with validation logic if needed in the future.
   *
   * **Note:** This method is intended for internal use only to address linting issues and should not
   * be considered a full validation mechanism.
   *
   * @param {unknown} data - The input data to validate.
   * @returns {data is RepositoryLocation} - Always returns `true`, marking the data as a `RepositoryLocation` type.
   */
  private static isRepositoryLocationResponse(data: unknown): data is RepositoryLocation {
    return true;
  }

  /**
   * Converts raw data into a single repository location instance.
   *
   * @param data - The raw repository location data from the server.
   * @returns A {@link RepositoryLocation} instance created from the provided data.
   */
  static toRepositoryLocation(data: unknown): RepositoryLocation {
    return RepositoryLocationMapper.isRepositoryLocationResponse(data) ? new RepositoryLocation(data) : new RepositoryLocation();
  }
}
