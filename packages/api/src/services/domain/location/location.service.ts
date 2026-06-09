import {LocationRestService} from './location-rest.service';
import {Location} from '../../../models/location';
import {Service} from '../../../providers/service/service';
import {ServiceProvider} from '../../../providers';
import {mapLocationResponseToModel} from './mappers/location.mapper';
import {RepositoryReference} from '../../../models/repositories';

/**
 * The LocationService class is responsible for fetching location-related data from the backend
 * and mapping the responses to application models.
 */
export class LocationService implements Service {
  private readonly locationRestService: LocationRestService;

  constructor() {
    this.locationRestService = ServiceProvider.get(LocationRestService);
  }

  /**
   * Retrieves the current location.
   *
   * @returns A promise resolving to the active location.
   */
  getActiveLocation(): Promise<Location> {
    return this.locationRestService
      .getActiveLocation()
      .then(mapLocationResponseToModel);
  }

  /**
   * Sets the specified repository as the default repository for the currently active location.
   *
   * @param repository The repository to set as the default repository.
   * @returns A promise that resolves when the default repository has been successfully updated.
   */
  async setDefaultRepository(repository: RepositoryReference): Promise<void> {
    return await this.locationRestService.setDefaultRepository(repository);
  }

  /**
   * Deletes the specified location.
   *
   * @param uri The URI of the location to delete.
   * @returns A promise that resolves when the location has been successfully deleted.
   */
  async deleteLocation(uri: string): Promise<void> {
    return this.locationRestService.deleteLocation(uri);
  }
}
