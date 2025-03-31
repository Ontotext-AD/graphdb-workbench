import {
  ServiceProvider,
  RepositoryService,
  RepositoryContextService,
  RepositoryLocationService,
  RepositoryLocationContextService
} from '@ontotext/workbench-api';

const loadRepositories = () => {
  return ServiceProvider.get(RepositoryService).getRepositories()
    .then((repositories) => {
      ServiceProvider.get(RepositoryContextService).updateRepositoryList(repositories);
    })
    .catch((error) => {
      throw new Error('Could not load repositories', error);
    });
};

const loadActiveRepositoryLocation = () => {
  return ServiceProvider.get(RepositoryLocationService).getActiveRepositoryLocation()
    .then((repositoryLocation) => {
      ServiceProvider.get(RepositoryLocationContextService).updateActiveRepositoryLocation(repositoryLocation);
    });
};

export const repositoryBootstrap = [loadRepositories, loadActiveRepositoryLocation];
