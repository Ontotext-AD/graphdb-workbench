import {Service} from '../../providers/service/service';
import {RepositoryRestService} from './repository-rest.service';
import {RepositoryList} from '../../models/repositories';
import {RepositoryListMapper} from './mappers/repository-list.mapper';
import {Mapper} from '../../providers/mapper/mapper';
import {InjectMapper} from '../../decorators/inject-mapper.decorator';
import {InjectService} from '../../decorators/inject-service.decorator';
import {ServiceProvider} from "../../providers";

export class RepositoryService implements Service {
    @InjectMapper(RepositoryListMapper)
    private repositoryListMapper: Mapper<RepositoryList> | undefined;

    @InjectService(RepositoryRestService)
    public repositoryRestService: RepositoryRestService | undefined;

  // constructor() {
  //   this.repositoryRestService = ServiceProvider.get(RepositoryRestService);
  // }

  /**
   * Retrieves the list of repositories.
   *
   * @returns A promise that resolves to the list of repositories.
   */
  getRepositories(): Promise<RepositoryList> {
      console.log('getRepositories', this.repositoryRestService);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return this.repositoryRestService
      .getRepositories()
      .then((response) => {
          if (!this.repositoryListMapper) {
              throw new Error('repositoryListMapper is not initialized');
          }
          return this.repositoryListMapper.mapToModel(response);
      });
  }
}
