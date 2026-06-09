import {HttpService} from '../../http/http.service';
import {LocationResponse} from './response/location-response';
import {RepositoryReference} from '../../../models/repositories';

export class LocationRestService extends HttpService {
  static readonly BASE_URL = 'rest/locations/active';

  getActiveLocation(): Promise<LocationResponse> {
    return this.get<LocationResponse>(LocationRestService.BASE_URL);
  }

  /**
   * Sets the specified repository as the default repository for the currently active location.
   *
   * @param repository The repository to set as the default repository.
   * @returns A promise that resolves when the default repository has been successfully updated.
   */
  setDefaultRepository(repository: RepositoryReference): Promise<void> {
    return this.post(`${LocationRestService.BASE_URL}/default-repository`, {
      body: {
        defaultRepository: repository.id
      }
    });
  }
}
