import {HttpService} from '../../http/http.service';
import {Repository, RepositoryReference} from '../../../models/repositories';
import {RepositoryListResponse} from './response/repository-response';
import {RepositorySizeInfoResponse} from './response/repository-info-response';

export class RepositoryRestService extends HttpService {

  static readonly REPOSITORIES_ENDPOINT = 'rest/repositories';

  /**
   * Fetches all available repositories.
   *
   * @param signal - Optional AbortSignal to cancel the request if needed.
   * @returns A promise that resolves with the list of available repositories.
   */
  getRepositories(signal?: AbortSignal): Promise<RepositoryListResponse> {
    return this.get(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/all`, {
      signal,
    });
  }

  getRepositorySizeInfo(repository: Repository): Promise<RepositorySizeInfoResponse> {
    return this.get(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/${this.encodeURIComponentStrict(repository.id)}/size?location=${encodeURIComponent(repository.location)}`);
  }

  /**
   * Deletes a repository from the specified location.
   *
   * @param repository The repository reference containing the repository identifier and location.
   * @returns A promise that resolves when the repository has been successfully deleted
   */
  deleteRepository(repository: RepositoryReference): Promise<void> {
    return this.delete(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/${this.encodeURIComponentStrict(repository.id)}`, {
      params: {
        location: repository.location
      }
    });
  }

  /**
   * Schedules a restart of a repository at the specified location.
   *
   * @param repository The repository reference containing the repository identifier and location.
   * @returns A promise that resolves when the restart operation has been successfully scheduled.
   */
  restartRepository(repository: RepositoryReference): Promise<void> {
    return this.post(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/${repository.id}/restart`, {
      params: {
        location: repository.location
      }
    });
  }
}
