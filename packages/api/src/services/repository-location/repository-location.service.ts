import {RepositoryLocationRestService} from './repository-location-rest.service';
import {RepositoryLocation} from '../../models/repository-location';
import {RepositoryLocationMapper} from './repository-location.mapper';
import {Service} from '../service';
import {ServiceProvider} from '../../service.provider';

/**
 * The RepositoryLocationService class is responsible for fetching repository-location-related data from the backend
 * and mapping the responses to application models.
 */
export class RepositoryLocationService implements Service {
  private locationRestService: RepositoryLocationRestService;

  constructor() {
    this.locationRestService = ServiceProvider.get(RepositoryLocationRestService);
  }

  /**
   * Retrieves the current repository location.
   *
   * @returns A promise resolving to the active repository location.
   */
  getActiveRepositoryLocation(): Promise<RepositoryLocation> {
    return this.locationRestService
      .getActiveRepositoryLocation()
      .then(RepositoryLocationMapper.toRepositoryLocation);
  }
}
