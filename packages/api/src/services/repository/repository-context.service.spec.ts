import {RepositoryContextService} from './repository-context.service';
import {Repository, RepositoryList} from '../../models/repositories';

describe('RepositoryContextService', () => {
  let repositoryContextService: RepositoryContextService;

  beforeEach(() => {
    repositoryContextService = new RepositoryContextService();
  });

  describe('Selected Repository Changed', () => {

    test('Should call the "onSelectedRepositoryChangedCallBackFunction" when the selected repository changes.', () => {
      const onSelectedRepositoryChangedCallBackFunction = jest.fn();
      const newRepository = createRepositoryInstance('repo-one');

      // When I register a callback function for selected repository changes,
      repositoryContextService.onSelectedRepositoryChanged(onSelectedRepositoryChangedCallBackFunction);
      // and the selected repository is changed,
      repositoryContextService.updateSelectedRepository(newRepository);

      // Then I expect the callback function to be called with the passed repository,
      expect(onSelectedRepositoryChangedCallBackFunction.mock.lastCall[0]).toEqual(newRepository);
      // but the repository should be a different instance.
      expect(onSelectedRepositoryChangedCallBackFunction.mock.lastCall[0]).not.toBe(newRepository);
    });

    test('Should stop calling the "onSelectedRepositoryChangedCallbackFunction" when unsubscribed from the event.', () => {
      const onSelectedRepositoryChangedCallbackFunction = jest.fn();
      const repository = createRepositoryInstance('repo-one');
      // Given:
      // I have registered the onSelectedRepositoryChangedCallbackFunction as a callback.
      const unsubscribeFunction = repositoryContextService.onSelectedRepositoryChanged(onSelectedRepositoryChangedCallbackFunction);
      // Clear the first callback call when the callback function is registered.
      onSelectedRepositoryChangedCallbackFunction.mockClear();

      // When I unsubscribe the function from the selected repository event,
      unsubscribeFunction();
      // and the selected repository is updated,
      repositoryContextService.updateSelectedRepository(createRepositoryInstance('repo-one'));

      // Then I expect the callback function to not be called.
      expect(onSelectedRepositoryChangedCallbackFunction).toHaveBeenCalledTimes(0);
    });
  });

  describe('Repositories Changed', () => {

    test('Should call the "onRepositoriesChangedCallbackFunction" when the repositories change.', () => {
      const onRepositoriesChangedCallbackFunction = jest.fn();
      const newRepositories = new RepositoryList([createRepositoryInstance('repo-one')]);

      // When I register a callback function for repository changes,
      repositoryContextService.onRepositoriesChanged(onRepositoriesChangedCallbackFunction);
      // and the repositories are updated,
      repositoryContextService.updateRepositories(newRepositories);

      // Then I expect the callback function to be called with the passed repositories,
      expect(onRepositoriesChangedCallbackFunction.mock.lastCall[0]).toEqual(newRepositories);
      // but the repositories should be a different instance.
      expect(onRepositoriesChangedCallbackFunction.mock.lastCall[0]).not.toBe(newRepositories);
    });

    test('Should stop calling the "onRepositoriesChangedCallbackFunction" when unsubscribed from the event.', () => {
      const onRepositoriesChangedCallbackFunction = jest.fn();
      // Given:
      // I have registered the onRepositoriesChangedCallbackFunction as a callback.
      const unsubscribeFunction = repositoryContextService.onRepositoriesChanged(onRepositoriesChangedCallbackFunction);
      // Clear the first callback call when the callback function is registered.
      onRepositoriesChangedCallbackFunction.mockClear();

      // When I unsubscribe the function from the repositories' change event,
      unsubscribeFunction();
      // and the repositories are updated,
      repositoryContextService.updateRepositories(new RepositoryList([createRepositoryInstance('repo-one')]));

      // Then I expect the callback function to not be called.
      expect(onRepositoriesChangedCallbackFunction).toHaveBeenCalledTimes(0);
    });
  });

  function createRepositoryInstance(id: string, location = 'http://example.com:7300') {
    return new Repository({id, location} as Repository);
  }
});
