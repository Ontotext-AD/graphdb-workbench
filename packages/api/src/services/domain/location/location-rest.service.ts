import {HttpService} from '../../http/http.service';
import {LocationListResponse, LocationResponse} from './response/location-response';
import {RepositoryReference} from '../../../models/repositories';

export class LocationRestService extends HttpService {
  static readonly BASE_URL = 'rest/locations';
  static readonly ACTIVE_LOCATION_URL = LocationRestService.BASE_URL + '/active';

  getActiveLocation(): Promise<LocationResponse> {
    return this.get<LocationResponse>(LocationRestService.ACTIVE_LOCATION_URL);
  }

  /**
   * Fetches all available locations.
   *
   * @param signal - Optional AbortSignal to cancel the request if needed.
   * @returns A promise that resolves with the list of available locations.
   */
  getLocations(signal?: AbortSignal): Promise<LocationListResponse> {
    return this.get(LocationRestService.BASE_URL, {
      signal,
    });
  }

  /**
   * Sets the specified repository as the default repository for the currently active location.
   *
   * @param repository The repository to set as the default repository.
   * @returns A promise that resolves when the default repository has been successfully updated.
   */
  setDefaultRepository(repository: RepositoryReference): Promise<void> {
    return this.post(`${LocationRestService.ACTIVE_LOCATION_URL}/default-repository`, {
      body: {
        defaultRepository: repository.id
      }
    });
  }

  /**
   * Deletes the specified location.
   *
   * @param uri The URI of the location to delete.
   * @returns A promise that resolves when the location has been successfully deleted.
   */
  deleteLocation(uri: string): Promise<void> {
    return this.delete(LocationRestService.BASE_URL, {
      params: {
        uri
      }
    });
  }
}
