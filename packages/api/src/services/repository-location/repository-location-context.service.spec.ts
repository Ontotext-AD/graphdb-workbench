import {RepositoryLocationContextService} from './repository-location-context.service';
import {RepositoryLocation} from '../../models/repository-location';

describe('RepositoryLocationContextService', () => {
  let repositoryLocationContextService: RepositoryLocationContextService;

  beforeEach(() => {
    repositoryLocationContextService = new RepositoryLocationContextService();
  });

  test('Should call the "onActiveLocationChangedCallbackFunction" when the active location changes.', () => {
    const onActiveLocationChangedCallbackFunction = jest.fn();
    const newRepositoryLocation = createRepositoryLocation('repo-location-uri');

    // When I register a callback function for active location changes,
    repositoryLocationContextService.onActiveLocationChanged(onActiveLocationChangedCallbackFunction);
    // and the active repository location is updated,
    repositoryLocationContextService.updateActiveLocation(newRepositoryLocation);

    // Then I expect the callback function to be called with the passed repository location.
    expect(onActiveLocationChangedCallbackFunction.mock.lastCall[0]).toEqual(newRepositoryLocation);
  });

  test('Should stop calling the "onActiveLocationChangedCallbackFunction" when unsubscribed from the event.', () => {
    const onActiveLocationChangedCallbackFunction = jest.fn();
    // Given:
    // I have registered the onActiveLocationChangedCallbackFunction callback function.
    const unsubscribeFunction = repositoryLocationContextService.onActiveLocationChanged(onActiveLocationChangedCallbackFunction);
    // Clear any previous calls to the callback function.
    onActiveLocationChangedCallbackFunction.mockClear();

    // When I unsubscribe the function from the active repository location change event,
    unsubscribeFunction();
    // and update the active repository location,
    repositoryLocationContextService.updateActiveLocation(createRepositoryLocation('repo-location-uri'));

    // Then I expect the callback function to not be called.
    expect(onActiveLocationChangedCallbackFunction).toHaveBeenCalledTimes(0);
  });

  function createRepositoryLocation(uri: string) {
    return new RepositoryLocation({uri} as RepositoryLocation);
  }
});
