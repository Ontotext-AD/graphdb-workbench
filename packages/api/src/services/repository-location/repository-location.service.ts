import {RepositoryLocationRestService} from './repository-location-rest.service';
import {RepositoryLocation} from '../../models/repository-location';
import {RepositoryLocationMapper} from './mappers/repository-location.mapper';
import {Service} from '../../providers/service/service';
import {MapperProvider, ServiceProvider} from '../../providers';
import {Mapper} from '../../providers/mapper/mapper';

/**
 * The RepositoryLocationService class is responsible for fetching repository-location-related data from the backend
 * and mapping the responses to application models.
 */
export class RepositoryLocationService implements Service {
  private locationRestService: RepositoryLocationRestService;
  private repositoryLocationMapper: Mapper<RepositoryLocation>;

  constructor() {
    this.locationRestService = ServiceProvider.get(RepositoryLocationRestService);
    this.repositoryLocationMapper = MapperProvider.get(RepositoryLocationMapper);
  }

  /**
   * Retrieves the current repository location.
   *
   * @returns A promise resolving to the active repository location.
   */
  getActiveRepositoryLocation(): Promise<RepositoryLocation> {
    return this.locationRestService
      .getActiveRepositoryLocation()
      .then(this.repositoryLocationMapper.mapToModel);
  }
}
