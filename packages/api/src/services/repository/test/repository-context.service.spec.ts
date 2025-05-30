import {RepositoryContextService} from '../repository-context.service';
import {Repository, RepositoryList} from '../../../models/repositories';

describe('RepositoryContextService', () => {
  let repositoryContextService: RepositoryContextService;

  beforeEach(() => {
    repositoryContextService = new RepositoryContextService();
  });

  test('Should call the "onSelectedRepositoryChangedCallBackFunction" when the selected repository changes.', async () => {
    const newRepositories = new RepositoryList([createRepositoryInstance('repo-one-id', 'under the rainbow')]);
    repositoryContextService.updateRepositoryList(newRepositories);
    const onSelectedRepositoryChangedCallBackFunction = jest.fn();
    const newRepository = createRepositoryInstance('repo-one-id', 'under the rainbow');

    // When I register a callback function for selected repository changes,
    repositoryContextService.onSelectedRepositoryChanged(onSelectedRepositoryChangedCallBackFunction);
    // and the selected repository is changed,
    await repositoryContextService.updateSelectedRepository(newRepository);

    // Then I expect the callback function to be called with the passed repository,
    expect(onSelectedRepositoryChangedCallBackFunction).toHaveBeenLastCalledWith(expect.objectContaining(newRepository));
    // but the repository should be a different instance.
    expect(onSelectedRepositoryChangedCallBackFunction.mock.lastCall[0]).not.toBe(newRepository);
  });

  test('Should stop calling the "onSelectedRepositoryChangedCallbackFunction" when unsubscribed from the event.', () => {
    const onSelectedRepositoryChangedCallbackFunction = jest.fn();
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

  test('Should call the "onRepositoriesChangedCallbackFunction" when the repositories change.', () => {
    const onRepositoriesChangedCallbackFunction = jest.fn();
    const newRepositories = new RepositoryList([createRepositoryInstance('repo-one')]);

    // When I register a callback function for repository changes,
    repositoryContextService.onRepositoryListChanged(onRepositoriesChangedCallbackFunction);
    // and the repositories are updated,
    repositoryContextService.updateRepositoryList(newRepositories);

    // Then I expect the callback function to be called with the passed repositories,
    expect(onRepositoriesChangedCallbackFunction).toHaveBeenLastCalledWith(newRepositories);
    // but the repositories should be a different instance.
    expect(onRepositoriesChangedCallbackFunction.mock.lastCall[0]).not.toBe(newRepositories);
  });

  test('Should call the callback function when the selected repository.', async () => {
    const newRepositories = new RepositoryList([createRepositoryInstance('repo-one-id', 'under the rainbow')]);
    repositoryContextService.updateRepositoryList(newRepositories);

    const onSelectedRepositoryIdChangedCallbackFunction = jest.fn();
    const newRepository = createRepositoryInstance('repo-one-id', 'under the rainbow');

    repositoryContextService.onSelectedRepositoryChanged(onSelectedRepositoryIdChangedCallbackFunction);
    await repositoryContextService.updateSelectedRepository(newRepository);

    // First time is on the subscription
    expect(onSelectedRepositoryIdChangedCallbackFunction).toHaveBeenCalledTimes(2);
    expect(onSelectedRepositoryIdChangedCallbackFunction).toHaveBeenLastCalledWith(expect.objectContaining(newRepository));
  });

  test('Should update the selected repository if provided.', async () => {
    const updateContextPropertySpy = jest.spyOn(repositoryContextService, 'updateContextProperty');
    const newRepositories = new RepositoryList([createRepositoryInstance('repo-one-id', 'under the rainbow')]);
    repositoryContextService.updateRepositoryList(newRepositories);
    const updatedRepository = createRepositoryInstance('repo-one-id', 'under the rainbow');

    await repositoryContextService.updateSelectedRepository(updatedRepository);

    expect(updateContextPropertySpy).toHaveBeenCalledWith(repositoryContextService.SELECTED_REPOSITORY, expect.objectContaining(updatedRepository));
  });

  test('Should update the selected repository, by clearing it from storage if undefined is provided.', async () => {
    const updateContextPropertySpy = jest.spyOn(repositoryContextService, 'updateContextProperty');

    await repositoryContextService.updateSelectedRepository(undefined);

    expect(updateContextPropertySpy).toHaveBeenCalledWith(repositoryContextService.SELECTED_REPOSITORY, undefined);
  });

  function createRepositoryInstance(id: string, location = 'http://example.com:7300') {
    return new Repository({id, location} as Repository);
  }
});
