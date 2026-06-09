import {
  service,
  RepositoryService,
  RepositoryContextService,
  RepositoryStorageService,
  LocationService,
  LocationContextService
} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

const loadRepositories = (): Promise<void> => {
  return service(RepositoryService).getRepositories()
    .then((repositories) => {
      const repositoryContextService = service(RepositoryContextService);
      // Initializing the repository context service with all repositories.
      repositoryContextService.updateRepositoryList(repositories);

      // Initializing the repository context service with the selected repository.
      const repositoryReference = service(RepositoryStorageService).getRepositoryReference();
      return repositoryContextService.updateSelectedRepository(repositoryReference);
    })
    .catch((error) => {
      logger.error('Could not load repositories', error);
    });
};

const loadActiveLocation = (): Promise<void> => {
  return service(LocationService).getActiveLocation()
    .then((activeLocation) => {
      service(LocationContextService).updateActiveLocation(activeLocation);
    });
};

export const repositoryBootstrap = [loadRepositories, loadActiveLocation];
