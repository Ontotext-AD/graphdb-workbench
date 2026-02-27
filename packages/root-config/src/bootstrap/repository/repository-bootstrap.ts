import {
  ServiceProvider,
  RepositoryService,
  RepositoryContextService,
  RepositoryStorageService,
  RepositoryLocationService,
  RepositoryLocationContextService
} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

const loadRepositories = (): Promise<void> => {
  return ServiceProvider.get(RepositoryService).getRepositories()
    .then((repositories) => {
      const repositoryContextService = ServiceProvider.get(RepositoryContextService);
      // Initializing the repository context service with all repositories.
      repositoryContextService.updateRepositoryList(repositories);

      // Initializing the repository context service with the selected repository.
      const repositoryReference = ServiceProvider.get(RepositoryStorageService).getRepositoryReference();
      return repositoryContextService.updateSelectedRepository(repositoryReference);
    })
    .catch((error) => {
      logger.error('Could not load repositories', error);
    });
};

const loadActiveRepositoryLocation = (): Promise<void> => {
  return ServiceProvider.get(RepositoryLocationService).getActiveRepositoryLocation()
    .then((repositoryLocation) => {
      ServiceProvider.get(RepositoryLocationContextService).updateActiveRepositoryLocation(repositoryLocation);
    });
};

export const repositoryBootstrap = [loadRepositories, loadActiveRepositoryLocation];
