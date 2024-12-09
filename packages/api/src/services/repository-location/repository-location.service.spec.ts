import {RepositoryLocationService} from './repository-location.service';
import {ServiceProvider} from '../../providers';
import {RepositoryLocationRestService} from './repository-location-rest.service';
import {RepositoryLocation} from '../../models/repository-location';

jest.mock('./repository-location-rest.service');
jest.mock('../../providers/service/service.provider');

describe('RepositoryLocationService', () => {
  let repositoryLocationService: RepositoryLocationService;
  let mockRepositoryLocationRestService: jest.Mocked<RepositoryLocationRestService>;

  beforeEach(() => {
    // Create the mock instance of RepositoryLocationRestService.
    mockRepositoryLocationRestService = new RepositoryLocationRestService() as jest.Mocked<RepositoryLocationRestService>;
    // Mock ServiceProvider.get to return the mockRepositoryLocationRestService.
    ServiceProvider.get = jest.fn().mockReturnValue(mockRepositoryLocationRestService);
    // Initialize RepositoryLocationService.
    repositoryLocationService = new RepositoryLocationService();
  });

  describe('getActiveRepositoryLocation', () => {
    test('should return the active repository location', async () => {
      // Mock the response from RepositoryLocationRestService.
      const rawRepository = {uri: 'repo-location-uri', label: 'repo-location-label'};
      mockRepositoryLocationRestService.getActiveRepositoryLocation = jest.fn().mockResolvedValue(rawRepository);
      const expectedResult = new RepositoryLocation(rawRepository as RepositoryLocation);

      // When the service is called to fetch the active repository location,
      const activeRepositoryLocation = await repositoryLocationService.getActiveRepositoryLocation();

      // Then the result should be an instance of RepositoryLocation,
      expect(activeRepositoryLocation).toBeInstanceOf(RepositoryLocation);
      // and it should match the expected repository location.
      expect(activeRepositoryLocation).toEqual(expectedResult);
    });
  });
});
