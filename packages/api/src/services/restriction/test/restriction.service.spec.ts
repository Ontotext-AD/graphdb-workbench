import {RestrictionService} from '../restriction.service';
import {RestrictionContextService} from '../restriction-context.service';
import {ViewRestriction, ViewRestrictionCondition} from '../../../models/restrictions';
import {ServiceProvider} from '../../../providers';
import {RepositoryContextService} from '../../domain/repository';
import {LicenseContextService} from '../../domain/license';
import {SecurityContextService, mapAuthenticatedUserResponseToModel} from '../../domain/security';
import {License} from '../../../models/license';
import {Repository, RepositoryList} from '../../../models/repositories';
import {Authority, AuthenticatedUser, AuthenticatedUserResponse} from '../../../models/security';
import {SecurityConfigTestUtil} from '../../utils/test/security-config-test-util';

const getSecurityConfig = (enabled: boolean) =>
  SecurityConfigTestUtil.createSecurityConfig({enabled});

const getUserWithAuthorities = (...authorities: Authority[]): AuthenticatedUser =>
  mapAuthenticatedUserResponseToModel({external: false, authorities} as unknown as AuthenticatedUserResponse);

const ONTOP_SESAME_TYPE = 'graphdb:OntopRepository';
const FEDX_SESAME_TYPE = 'graphdb:FedXRepository';

describe('RestrictionService', () => {
  const restrictionService = ServiceProvider.get(RestrictionService);
  const restrictionContextService = ServiceProvider.get(RestrictionContextService);
  const repositoryContextService = ServiceProvider.get(RepositoryContextService);
  const licenseContextService = ServiceProvider.get(LicenseContextService);
  const securityContextService = ServiceProvider.get(SecurityContextService);

  beforeEach(async () => {
    // GIVEN: A view with no declared conditions, a valid license, disabled security and no selected repository
    restrictionService.updateViewRestriction(new ViewRestriction());
    licenseContextService.updateGraphdbLicense(new License({valid: true}));
    securityContextService.updateSecurityConfig(getSecurityConfig(false));
    securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
    repositoryContextService.updateRepositoryList(new RepositoryList([]));
    await repositoryContextService.updateSelectedRepository(undefined);
  });

  test('updateViewRestriction should store the given view restriction in the context', () => {
    // GIVEN: A view restriction
    const viewRestriction = new ViewRestriction({restrictions: [ViewRestrictionCondition.WRITE, ViewRestrictionCondition.ONTOP]});

    // WHEN: Updating the view restriction
    restrictionService.updateViewRestriction(viewRestriction);
    // THEN: The context should contain the given view restriction
    expect(restrictionContextService.viewRestriction()).toEqual(viewRestriction);
  });

  test('a view with no declared conditions should never be restricted', () => {
    // GIVEN: An invalid license
    licenseContextService.updateGraphdbLicense(new License({valid: false}));

    // WHEN: Updating the view restriction with no declared conditions
    restrictionService.updateViewRestriction(new ViewRestriction());
    // THEN: The view should not be restricted
    expect(restrictionContextService.isViewRestricted()).toBe(false);
  });

  describe('license condition', () => {
    test('should restrict the view when the license is invalid', () => {
      // GIVEN: An invalid license
      licenseContextService.updateGraphdbLicense(new License({valid: false}));

      // WHEN: Updating the view restriction with the license condition
      restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.LICENSE]}));
      // THEN: The view should be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(true);
    });

    test('should not restrict the view when the license is valid', () => {
      // GIVEN: A valid license
      licenseContextService.updateGraphdbLicense(new License({valid: true}));

      // WHEN: Updating the view restriction with the license condition
      restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.LICENSE]}));
      // THEN: The view should not be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });

    test('should recalculate when the license changes', () => {
      // GIVEN: A view restriction with the license condition and a valid license
      restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.LICENSE]}));
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
      restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.WRITE]}));
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
      restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.WRITE]}));
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
      restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.WRITE]}));
      // THEN: The view should not be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });

    test('should recalculate when the selected repository changes', async () => {
      // GIVEN: A view restriction with the write condition, enabled security, no selected repository
      // and a user with write access only to a specific repository
      const writableRepository = new Repository({id: 'writableRepo'});
      repositoryContextService.updateRepositoryList(new RepositoryList([writableRepository]));
      securityContextService.updateSecurityConfig(getSecurityConfig(true));
      securityContextService.updateAuthenticatedUser(getUserWithAuthorities(Authority.ROLE_USER, `WRITE_REPO_${writableRepository.id}` as Authority));
      restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.WRITE]}));
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
      restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.WRITE]}));
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
      restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.ONTOP]}));
      // THEN: The view should be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(true);
    });

    test('should not restrict the view when the active repository is not Ontop', async () => {
      // GIVEN: An active non-Ontop repository
      const repository = new Repository({id: 'testRepo'});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);

      // WHEN: Updating the view restriction with the ontop condition
      restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.ONTOP]}));
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
      restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.FEDX]}));
      // THEN: The view should be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(true);
    });

    test('should not restrict the view when the active repository is not FedX', async () => {
      // GIVEN: An active non-FedX repository
      const repository = new Repository({id: 'testRepo'});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);

      // WHEN: Updating the view restriction with the fedx condition
      restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.FEDX]}));
      // THEN: The view should not be restricted
      expect(restrictionContextService.isViewRestricted()).toBe(false);
    });
  });

  test('should restrict the view when at least one of several declared conditions holds', () => {
    // GIVEN: An invalid license, while the other conditions have no applicable active repository
    licenseContextService.updateGraphdbLicense(new License({valid: false}));

    // WHEN: Updating the view restriction with multiple declared conditions
    restrictionService.updateViewRestriction(new ViewRestriction({restrictions: [ViewRestrictionCondition.WRITE, ViewRestrictionCondition.ONTOP, ViewRestrictionCondition.FEDX, ViewRestrictionCondition.LICENSE]}));
    // THEN: The view should be restricted because the license condition holds
    expect(restrictionContextService.isViewRestricted()).toBe(true);
  });
});
