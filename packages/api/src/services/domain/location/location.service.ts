import {LocationRestService} from './location-rest.service';
import {Location} from '../../../models/location';
import {Service} from '../../../providers/service/service';
import {ServiceProvider} from '../../../providers';
import {mapLocationResponseToModel} from './mappers/location.mapper';

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
}
