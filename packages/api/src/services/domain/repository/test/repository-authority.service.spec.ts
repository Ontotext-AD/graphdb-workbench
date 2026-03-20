import {RepositoryAuthorityService} from '../repository-authority.service';
import {RepositoryMockProvider} from './repository-mock-provider';

describe('RepositoryAuthorityService', () => {
  let service: RepositoryAuthorityService;

  beforeEach(() => {
    service = new RepositoryAuthorityService();
  });

  describe('isSystemRepository', () => {
    test('should return true when repository id is SYSTEM', () => {
      // Given I have a repository with id SYSTEM
      const repository = RepositoryMockProvider.provideRepository('SYSTEM');

      // When I check if it is a system repository
      // Then I expect it to be true
      expect(service.isSystemRepository(repository)).toBe(true);
    });

    test('should return false when repository id is not SYSTEM', () => {
      // Given I have a repository with a non-system id
      const repository = RepositoryMockProvider.provideRepository('my-repo');

      // When I check if it is a system repository
      // Then I expect it to be false
      expect(service.isSystemRepository(repository)).toBe(false);
    });
  });

  describe('getCurrentRepoAuthority', () => {
    test('should generate authority string for a specific action and repository id', () => {
      // Given I have an action and a repository id
      const action = 'READ';
      const repositoryId = 'my-repo';

      // When I get the current repo authority
      const result = service.getCurrentRepoAuthority(action, repositoryId);

      // Then I expect the authority string to be in the format ACTION_REPO_ID
      expect(result).toBe('READ_REPO_my-repo');
    });

    test('should generate authority string for WRITE action', () => {
      // Given I have a WRITE action and a repository id
      const result = service.getCurrentRepoAuthority('WRITE', 'test-repo');

      // Then I expect the correct authority string
      expect(result).toBe('WRITE_REPO_test-repo');
    });
  });

  describe('getOverallRepoAuthority', () => {
    test('should generate authority string for all repositories using wildcard', () => {
      // Given I have an action
      const action = 'READ';

      // When I get the overall repo authority
      const result = service.getOverallRepoAuthority(action);

      // Then I expect the authority string to use a wildcard
      expect(result).toBe('READ_REPO_*');
    });

    test('should generate authority string for WRITE action with wildcard', () => {
      // Given I have a WRITE action
      const result = service.getOverallRepoAuthority('WRITE');

      // Then I expect the correct authority string with wildcard
      expect(result).toBe('WRITE_REPO_*');
    });
  });

  describe('getCurrentGqlRepoAuthority', () => {
    test('should generate GraphQL authority string for a specific action and repository id', () => {
      // Given I have an action and a repository id
      const action = 'READ';
      const repositoryId = 'my-repo';

      // When I get the current GraphQL repo authority
      const result = service.getCurrentGqlRepoAuthority(action, repositoryId);

      // Then I expect the authority string to have the GRAPHQL suffix
      expect(result).toBe('READ_REPO_my-repo:GRAPHQL');
    });

    test('should generate GraphQL authority string for WRITE action', () => {
      // Given I have a WRITE action and a repository id
      const result = service.getCurrentGqlRepoAuthority('WRITE', 'test-repo');

      // Then I expect the correct GraphQL authority string
      expect(result).toBe('WRITE_REPO_test-repo:GRAPHQL');
    });
  });

  describe('getOverallGqlRepoAuthority', () => {
    test('should generate GraphQL authority string for all repositories using wildcard', () => {
      // Given I have an action
      const action = 'READ';

      // When I get the overall GraphQL repo authority
      const result = service.getOverallGqlRepoAuthority(action);

      // Then I expect the authority string to use a wildcard and have the GRAPHQL suffix
      expect(result).toBe('READ_REPO_*:GRAPHQL');
    });

    test('should generate GraphQL authority string for WRITE action with wildcard', () => {
      // Given I have a WRITE action
      const result = service.getOverallGqlRepoAuthority('WRITE');

      // Then I expect the correct GraphQL authority string with wildcard
      expect(result).toBe('WRITE_REPO_*:GRAPHQL');
    });
  });

  describe('getLocationSpecificId', () => {
    test('should return id@location when repository has a location', () => {
      // Given I have a repository with an id and a location
      const repository = RepositoryMockProvider.provideRepository('my-repo', 'http://remote-host:7200');

      // When I get the location-specific id
      const result = service.getLocationSpecificId(repository);

      // Then I expect the id to include the location
      expect(result).toBe('my-repo@http://remote-host:7200');
    });

    test('should return just the repository id when location is empty', () => {
      // Given I have a repository with an id and no location
      const repository = RepositoryMockProvider.provideRepository('my-repo', '');

      // When I get the location-specific id
      const result = service.getLocationSpecificId(repository);

      // Then I expect only the repository id
      expect(result).toBe('my-repo');
    });

    test('should return just the repository id when location is not set', () => {
      // Given I have a repository with no location
      const repository = RepositoryMockProvider.provideRepository('my-repo');

      // When I get the location-specific id
      const result = service.getLocationSpecificId(repository);

      // Then I expect only the repository id
      expect(result).toBe('my-repo');
    });
  });
});

