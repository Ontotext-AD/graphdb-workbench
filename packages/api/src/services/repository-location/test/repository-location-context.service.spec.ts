import {RepositoryLocationContextService} from '../repository-location-context.service';
import {RepositoryLocation} from '../../../models/repository-location';

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
    expect(onActiveLocationChangedCallbackFunction).toHaveBeenLastCalledWith(newRepositoryLocation);
  });

  function createRepositoryLocation(uri: string) {
    return new RepositoryLocation({uri} as RepositoryLocation);
  }
});
