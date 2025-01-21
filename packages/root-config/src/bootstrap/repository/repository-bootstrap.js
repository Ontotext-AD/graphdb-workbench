import {ServiceProvider, RepositoryService, RepositoryContextService} from '@ontotext/workbench-api';

const loadRepositories = () => {
  return ServiceProvider.get(RepositoryService).getRepositories()
    .then((repositories) => {
      ServiceProvider.get(RepositoryContextService).updateRepositoryList(repositories);
    })
    .catch((error) => {
      throw new Error('Could not load repositories', error);
    });
};

export const repositoryBootstrap = [loadRepositories];
