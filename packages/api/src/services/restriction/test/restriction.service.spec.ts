import {RestrictionService} from '../restriction.service';
import {RestrictionContextService} from '../restriction-context.service';
import {ViewRestriction, ViewRestrictionCondition} from '../../../models/restrictions';
import {ServiceProvider} from '../../../providers';
import {RepositoryContextService} from '../../domain/repository';
import {LicenseContextService} from '../../domain/license';
import {SecurityContextService, mapAuthenticatedUserResponseToModel} from '../../domain/security';
import {License} from '../../../models/license';
import {Repository, RepositoryList, RepositoryPermissionType, RepositoryType} from '../../../models/repositories';
import {Authority, AuthenticatedUser, AuthenticatedUserResponse} from '../../../models/security';
import {SecurityConfigTestUtil} from '../../utils/test/security-config-test-util';

const getSecurityConfig = (enabled: boolean) =>
  SecurityConfigTestUtil.createSecurityConfig({enabled});

const getUserWithAuthorities = (...authorities: Authority[]): AuthenticatedUser =>
  mapAuthenticatedUserResponseToModel({external: false, authorities} as unknown as AuthenticatedUserResponse);

const ONTOP_SESAME_TYPE = 'graphdb:OntopRepository';
const FEDX_SESAME_TYPE = 'graphdb:FedXRepository';

describe('RestrictionService', () => {
  // Creating the service registers its subscriptions, which recalculate the restricted state.
  ServiceProvider.get(RestrictionService);
  const restrictionContextService = ServiceProvider.get(RestrictionContextService);
  const repositoryContextService = ServiceProvider.get(RepositoryContextService);
  const licenseContextService = ServiceProvider.get(LicenseContextService);
  const securityContextService = ServiceProvider.get(SecurityContextService);

  beforeEach(async () => {
    // GIVEN: A view with no declared conditions, a valid license, disabled security and no selected repository
    restrictionContextService.updateViewRestriction(new ViewRestriction());
    licenseContextService.updateGraphdbLicense(new License({valid: true}));
    securityContextService.updateSecurityConfig(getSecurityConfig(false));
    securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
    repositoryContextService.updateRepositoryList(new RepositoryList([]));
    await repositoryContextService.updateSelectedRepository(undefined);
  });

  describe('license condition', () => {
    test('should recalculate when the license changes', () => {
      // GIVEN: A view restriction with the license condition and a valid license
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.IS_LICENSE_INVALID]));
      expect(restrictionContextService.isViewRestricted()).toBe(false);

      // WHEN: The license becomes invalid
      licenseContextService.updateGraphdbLicense(new License({valid: false}));
      // THEN: The view should become restricted without updating the view restriction again
      expect(restrictionContextService.isViewRestricted()).toBe(true);
    });
  });

  describe('write condition', () => {
    test('should restrict the view when security is enabled and the user cannot write to the active repository', async () => {
      // GIVEN: An active repository, enabled security and a user without write access
      const repository = new Repository({id: 'testRepo'});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);
      securityContextService.updateSecurityConfig(getSecurityConfig(true));
      securityContextService.updateAuthenticatedUser(getUserWithAuthorities(Authority.ROLE_USER));

      // WHEN: Updating the view restriction with the write condition
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS]));
      // THEN: The view should be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(true);
    });

    test('should not restrict the view when security is disabled', async () => {
      // GIVEN: An active repository and disabled security
      const repository = new Repository({id: 'testRepo'});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);
      securityContextService.updateSecurityConfig(getSecurityConfig(false));

      // WHEN: Updating the view restriction with the write condition
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS]));
      // THEN: The view should not be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });

    test('should not restrict the view when the user can write to the active repository', async () => {
      // GIVEN: An active repository, enabled security and an admin user
      const repository = new Repository({id: 'testRepo'});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);
      securityContextService.updateSecurityConfig(getSecurityConfig(true));
      securityContextService.updateAuthenticatedUser(getUserWithAuthorities(Authority.ROLE_ADMIN));

      // WHEN: Updating the view restriction with the write condition
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS]));
      // THEN: The view should not be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });

    test('should not restrict the view when no repository is selected', () => {
      // GIVEN: Enabled security, a user without write access and no selected repository
      securityContextService.updateSecurityConfig(getSecurityConfig(true));
      securityContextService.updateAuthenticatedUser(getUserWithAuthorities(Authority.ROLE_USER));

      // WHEN: Updating the view restriction with the write condition
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS]));
      // THEN: The view should not be restricted, as there is no repository to write to
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });

    test('should recalculate when the selected repository changes', async () => {
      // GIVEN: A view restriction with the write condition, enabled security, a selected read-only repository
      // and a user with write access only to another repository
      const readOnlyRepository = new Repository({id: 'readOnlyRepo'});
      const writableRepository = new Repository({id: 'writableRepo'});
      repositoryContextService.updateRepositoryList(new RepositoryList([readOnlyRepository, writableRepository]));
      await repositoryContextService.updateSelectedRepository(readOnlyRepository);
      securityContextService.updateSecurityConfig(getSecurityConfig(true));
      securityContextService.updateAuthenticatedUser(getUserWithAuthorities(Authority.ROLE_USER, `WRITE_REPO_${writableRepository.id}` as Authority));
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS]));
      expect(restrictionContextService.isViewRestricted()).toBe(true);

      // WHEN: The selected repository changes to the one the user can write to
      await repositoryContextService.updateSelectedRepository(writableRepository);
      // THEN: The view should no longer be restricted without updating the view restriction again
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });

    test('should recalculate when the authenticated user changes', async () => {
      // GIVEN: A view restriction with the write condition, an active repository, enabled security and a user without write access
      const repository = new Repository({id: 'testRepo'});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);
      securityContextService.updateSecurityConfig(getSecurityConfig(true));
      securityContextService.updateAuthenticatedUser(getUserWithAuthorities(Authority.ROLE_USER));
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS]));
      expect(restrictionContextService.isViewRestricted()).toBe(true);

      // WHEN: The authenticated user changes to one who can write to the active repository
      securityContextService.updateAuthenticatedUser(getUserWithAuthorities(Authority.ROLE_ADMIN));
      // THEN: The view should no longer be restricted without updating the view restriction again
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });
  });

  describe('ontop condition', () => {
    test('should restrict the view when the active repository is Ontop', async () => {
      // GIVEN: An active Ontop repository
      const ontopRepository = new Repository({id: 'ontopRepo', sesameType: ONTOP_SESAME_TYPE});
      repositoryContextService.updateRepositoryList(new RepositoryList([ontopRepository]));
      await repositoryContextService.updateSelectedRepository(ontopRepository);

      // WHEN: Updating the view restriction with the ontop condition
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.IS_ONTOP]));
      // THEN: The view should be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(true);
    });

    test('should not restrict the view when the active repository is not Ontop', async () => {
      // GIVEN: An active non-Ontop repository
      const repository = new Repository({id: 'testRepo'});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);

      // WHEN: Updating the view restriction with the ontop condition
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.IS_ONTOP]));
      // THEN: The view should not be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });
  });

  describe('fedx condition', () => {
    test('should restrict the view when the active repository is FedX', async () => {
      // GIVEN: An active FedX repository
      const fedxRepository = new Repository({id: 'fedxRepo', sesameType: FEDX_SESAME_TYPE});
      repositoryContextService.updateRepositoryList(new RepositoryList([fedxRepository]));
      await repositoryContextService.updateSelectedRepository(fedxRepository);

      // WHEN: Updating the view restriction with the fedx condition
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.IS_FEDEX]));
      // THEN: The view should be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(true);
    });

    test('should not restrict the view when the active repository is not FedX', async () => {
      // GIVEN: An active non-FedX repository
      const repository = new Repository({id: 'testRepo'});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);

      // WHEN: Updating the view restriction with the fedx condition
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.IS_FEDEX]));
      // THEN: The view should not be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });
  });

  describe('repository not selected condition', () => {
    test('should restrict the view when no repository is selected', () => {
      // GIVEN: No selected repository

      // WHEN: Updating the view restriction with the repository not selected condition
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED]));
      // THEN: The view should be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(true);
    });

    test('should not restrict a view that does not declare the condition when no repository is selected', () => {
      // GIVEN: No selected repository

      // WHEN: Updating the view restriction with no declared conditions
      restrictionContextService.updateViewRestriction(new ViewRestriction());
      // THEN: The view should not be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });

    test('should recalculate when a repository is selected', async () => {
      // GIVEN: A view restriction with the repository not selected condition and no selected repository
      const repository = new Repository({id: 'testRepo'});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED]));
      expect(restrictionContextService.isViewRestricted()).toBe(true);

      // WHEN: A repository is selected
      await repositoryContextService.updateSelectedRepository(repository);
      // THEN: The view should no longer be restricted without updating the view restriction again
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });
  });

  describe('repository filters', () => {
    test('should restrict the view when the selected repository is not of an allowed type', async () => {
      // GIVEN: A selected GraphDB repository
      const repository = new Repository({id: 'testRepo', type: RepositoryType.GRAPH_DB});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);

      // WHEN: Updating the view restriction to allow only Ontop repositories
      restrictionContextService.updateViewRestriction(new ViewRestriction([], [RepositoryType.ONTOP]));
      // THEN: The view should be restricted, as the selected repository is not usable in it
      expect(restrictionContextService.isViewRestricted()).toBe(true);
    });

    test('should restrict the view when the user lacks the required permission on the selected repository', async () => {
      // GIVEN: A selected repository, enabled security and a user who can only read it
      const repository = new Repository({id: 'testRepo', type: RepositoryType.GRAPH_DB});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);
      securityContextService.updateSecurityConfig(getSecurityConfig(true));
      securityContextService.updateAuthenticatedUser(getUserWithAuthorities(Authority.ROLE_USER, `READ_REPO_${repository.id}` as Authority));

      // WHEN: Updating the view restriction to require the maintain permission
      restrictionContextService.updateViewRestriction(new ViewRestriction([], [RepositoryType.GRAPH_DB], RepositoryPermissionType.MAINTAIN));
      // THEN: The view should be restricted, as the selected repository is not usable in it
      expect(restrictionContextService.isViewRestricted()).toBe(true);
    });

    test('should not restrict the view when the selected repository passes the filters', async () => {
      // GIVEN: A selected GraphDB repository, enabled security and a repository manager
      const repository = new Repository({id: 'testRepo', type: RepositoryType.GRAPH_DB});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);
      securityContextService.updateSecurityConfig(getSecurityConfig(true));
      securityContextService.updateAuthenticatedUser(getUserWithAuthorities(Authority.ROLE_REPO_MANAGER));

      // WHEN: Updating the view restriction to allow only GraphDB repositories with the maintain permission
      restrictionContextService.updateViewRestriction(new ViewRestriction([], [RepositoryType.GRAPH_DB], RepositoryPermissionType.MAINTAIN));
      // THEN: The view should not be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });

    test('should not restrict the view when no repository is selected', () => {
      // GIVEN: No selected repository

      // WHEN: Updating the view restriction with repository filters only
      restrictionContextService.updateViewRestriction(new ViewRestriction([], [RepositoryType.ONTOP], RepositoryPermissionType.MAINTAIN));
      // THEN: The view should not be restricted, as there is no selected repository to filter
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });
  });

  test('should restrict the view when at least one of several declared conditions holds', () => {
    // GIVEN: An invalid license, while the other conditions have no applicable active repository
    licenseContextService.updateGraphdbLicense(new License({valid: false}));

    // WHEN: Updating the view restriction with multiple declared conditions
    restrictionContextService.updateViewRestriction(new ViewRestriction([ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS, ViewRestrictionCondition.IS_ONTOP, ViewRestrictionCondition.IS_FEDEX, ViewRestrictionCondition.IS_LICENSE_INVALID]));
    // THEN: The view should be restricted because the license condition holds
    expect(restrictionContextService.isViewRestricted()).toBe(true);
  });
});
