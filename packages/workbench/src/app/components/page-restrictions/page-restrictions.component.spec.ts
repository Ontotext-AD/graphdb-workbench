import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  AuthenticatedUser,
  AuthorityList,
  License,
  LicenseContextService,
  Repository,
  RepositoryContextService,
  RepositoryList,
  RepositoryPermissionType,
  RepositoryType,
  RestrictionContextService,
  SecurityConfig,
  SecurityContextService,
  service,
  ViewRestriction,
  ViewRestrictionCondition,
} from '@ontotext/workbench-api';

import { PageRestrictionsComponent } from './page-restrictions.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {mockResizeObserverForTesting} from '../../../testing-utils/resize-observer-testing-utils';

const NO_WRITE_PERMISSION = 'you have no write permission to the repository';
const READ_ONLY_ONTOP = 'is read-only Virtual Repository';
const FEDX_UNSUPPORTED = 'view is not supported by FedX Repository';
const INVALID_LICENSE = 'your license is not valid';
const NO_ACCESSIBLE_WRITABLE_REPOS = 'There are no accessible writable repositories.';
const NOT_CONNECTED_TO_REPOSITORY = 'you are not connected to any repository';
const SELECT_REPOSITORY = 'Some functionalities are not available because you are not connected to any repository. Select a repository below.';

const createRepository = (id: string, sesameType?: string) => new Repository({
  id,
  title: id,
  location: '',
  uri: `http://${id}`,
  sesameType,
});

describe('PageRestrictionsComponent', () => {
  let fixture: ComponentFixture<PageRestrictionsComponent>;
  const licenseContextService = service(LicenseContextService);
  const securityContextService = service(SecurityContextService);
  const repositoryContextService = service(RepositoryContextService);
  const restrictionContextService = service(RestrictionContextService);

  mockResizeObserverForTesting();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageRestrictionsComponent, provideTranslocoForTesting()],
      providers: [provideRouter([])],
    })
      .compileComponents();
  });

  afterEach(async () => {
    licenseContextService.updateGraphdbLicense(undefined);
    securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
    securityContextService.updateSecurityConfig(undefined as unknown as SecurityConfig);
    await repositoryContextService.updateSelectedRepository(undefined);
    repositoryContextService.updateRepositoryList(undefined as unknown as RepositoryList);
    restrictionContextService.updateViewRestriction(new ViewRestriction());
  });

  const givenLicense = (valid: boolean) => {
    licenseContextService.updateGraphdbLicense(new License({valid}));
  };

  const givenSecuredUser = (authorities: string[]) => {
    const user = new AuthenticatedUser();
    user.username = 'user';
    user.setAuthorities(new AuthorityList(authorities));
    securityContextService.updateAuthenticatedUser(user);
    securityContextService.updateSecurityConfig(new SecurityConfig({
      enabled: true,
      overrideAuth: {appSettings: {}},
      freeAccess: {appSettings: {}}
    } as unknown as SecurityConfig));
  };

  const givenRepositories = async (repositories: Repository[], selected?: Repository) => {
    repositoryContextService.updateRepositoryList(new RepositoryList(repositories));
    await repositoryContextService.updateSelectedRepository(selected);
  };

  const givenDeclaredRestrictions = (restrictions: ViewRestrictionCondition[], allowedRepositoryTypes?: RepositoryType[], requiredRepositoryPermission?: RepositoryPermissionType) => {
    restrictionContextService.updateViewRestriction(new ViewRestriction(restrictions, allowedRepositoryTypes, requiredRepositoryPermission));
  };

  const render = async () => {
    fixture = TestBed.createComponent(PageRestrictionsComponent);
    fixture.componentRef.setInput('title', 'Test page');
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const getMessages = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('p-message') as NodeListOf<HTMLElement>)
      .map((message) => message.textContent?.trim() ?? '');

  const getPickerRepositoryIds = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.repository-id') as NodeListOf<HTMLElement>)
      .map((repositoryId) => repositoryId.textContent?.trim() ?? '');

  it('should create', async () => {
    await render();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('when the page declares no restrictions', () => {
    it('should not restrict a read-only user on a selected repository', async () => {
      // GIVEN: a valid license, a read-only user and a selected repository
      givenLicense(true);
      givenSecuredUser(['READ_REPO_repo']);
      const repository = createRepository('repo');
      await givenRepositories([repository], repository);

      // WHEN: rendering a page without declared restrictions
      await render();

      // THEN: no restriction reason should be shown
      expect(getMessages()).toEqual([]);
    });

    it('should not show an invalid license warning', async () => {
      // GIVEN: an invalid license and a selected repository
      givenLicense(false);
      const repository = createRepository('repo');
      await givenRepositories([repository], repository);

      // WHEN: rendering a page without declared restrictions
      await render();

      // THEN: no restriction reason should be shown
      expect(getMessages()).toEqual([]);
    });

    it('should not report an Ontop or FedX repository', async () => {
      // GIVEN: a valid license and a selected FedX repository
      givenLicense(true);
      const repository = createRepository('fedx', 'graphdb:FedXRepository');
      await givenRepositories([repository], repository);

      // WHEN: rendering a page without declared restrictions
      await render();

      // THEN: no restriction reason should be shown
      expect(getMessages()).toEqual([]);
    });
  });

  describe('when the page declares the license restriction', () => {
    it('should show the invalid license warning for a selected repository', async () => {
      // GIVEN: an invalid license and a selected repository
      givenLicense(false);
      const repository = createRepository('repo');
      await givenRepositories([repository], repository);
      givenDeclaredRestrictions([ViewRestrictionCondition.IS_LICENSE_INVALID]);

      // WHEN: rendering the page
      await render();

      // THEN: only the invalid license warning should be shown
      const messages = getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain(INVALID_LICENSE);
      // AND: the repository picker should not be shown, as another repository doesn't help
      expect(fixture.nativeElement.querySelector('app-repository-picker-list')).toBeNull();
    });

    it('should list readable repositories and not require write access when no repository is selected', async () => {
      // GIVEN: an invalid license, a read-only user and no selected repository
      givenLicense(false);
      givenSecuredUser(['READ_REPO_repo']);
      await givenRepositories([createRepository('repo')]);
      givenDeclaredRestrictions([ViewRestrictionCondition.IS_LICENSE_INVALID, ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED]);

      // WHEN: rendering the page
      await render();

      // THEN: the invalid license warning should be shown first, followed by the select repository message,
      // without the writable repositories message
      const messages = getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0]).toContain(INVALID_LICENSE);
      expect(messages[1]).toContain(NOT_CONNECTED_TO_REPOSITORY);
      // AND: the readable repository should be offered in the picker
      expect(getPickerRepositoryIds()).toEqual(['repo']);
    });
  });

  describe('when the page declares the write restriction', () => {
    it('should show the no write permission warning for a read-only user', async () => {
      // GIVEN: a valid license, a user who cannot write to the selected repository but can write to another one
      givenLicense(true);
      givenSecuredUser(['READ_REPO_repo', 'READ_REPO_other', 'WRITE_REPO_other']);
      const repository = createRepository('repo');
      await givenRepositories([repository, createRepository('other')], repository);
      givenDeclaredRestrictions([ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS]);

      // WHEN: rendering the page
      await render();

      // THEN: the no write permission warning should be shown
      const messages = getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain(NO_WRITE_PERMISSION);
      // AND: the writable repository should be offered in the picker
      expect(getPickerRepositoryIds()).toEqual(['other']);
    });

    it('should only offer writable repositories when no repository is selected', async () => {
      // GIVEN: a valid license, a user who can write only to one of the repositories and no selected repository
      givenLicense(true);
      givenSecuredUser(['READ_REPO_readable', 'READ_REPO_writable', 'WRITE_REPO_writable']);
      await givenRepositories([createRepository('readable'), createRepository('writable')]);
      givenDeclaredRestrictions([ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS, ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED]);

      // WHEN: rendering the page
      await render();

      // THEN: only the writable repository should be offered in the picker
      expect(getPickerRepositoryIds()).toEqual(['writable']);
    });

    it('should report that there are no writable repositories', async () => {
      // GIVEN: a valid license, a read-only user and no selected repository
      givenLicense(true);
      givenSecuredUser(['READ_REPO_repo']);
      await givenRepositories([createRepository('repo')]);
      givenDeclaredRestrictions([ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS]);

      // WHEN: rendering the page
      await render();

      // THEN: the no accessible writable repositories message should be shown
      expect(getMessages()).toContain(NO_ACCESSIBLE_WRITABLE_REPOS);
    });

    it('should report only the missing writable repositories when a repository must be selected', async () => {
      // GIVEN: a valid license, a read-only user and no selected repository
      givenLicense(true);
      givenSecuredUser(['READ_REPO_repo']);
      await givenRepositories([createRepository('repo')]);
      givenDeclaredRestrictions([ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS, ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED]);

      // WHEN: rendering the page
      await render();

      // THEN: only the no accessible writable repositories message should be shown
      expect(getMessages()).toEqual([NO_ACCESSIBLE_WRITABLE_REPOS]);
      // AND: the picker should offer no repository
      expect(getPickerRepositoryIds()).toEqual([]);
    });
  });

  describe('when the page declares the Ontop and FedX restrictions', () => {
    it('should report a selected Ontop repository even if the user cannot write to it', async () => {
      // GIVEN: a valid license, a read-only user and a selected Ontop repository
      givenLicense(true);
      givenSecuredUser(['READ_REPO_ontop']);
      const repository = createRepository('ontop', 'graphdb:OntopRepository');
      await givenRepositories([repository], repository);
      givenDeclaredRestrictions([ViewRestrictionCondition.IS_ONTOP, ViewRestrictionCondition.IS_FEDEX]);

      // WHEN: rendering the page
      await render();

      // THEN: the read-only Ontop warning should be shown
      const messages = getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain(READ_ONLY_ONTOP);
    });

    it('should report a selected FedX repository', async () => {
      // GIVEN: a valid license and a selected FedX repository
      givenLicense(true);
      const repository = createRepository('fedx', 'graphdb:FedXRepository');
      await givenRepositories([repository], repository);
      givenDeclaredRestrictions([ViewRestrictionCondition.IS_ONTOP, ViewRestrictionCondition.IS_FEDEX]);

      // WHEN: rendering the page
      await render();

      // THEN: the FedX warning should be shown
      const messages = getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain(FEDX_UNSUPPORTED);
    });

    it('should report a selected FedX repository excluded by the allowed types and offer the allowed repositories', async () => {
      // GIVEN: a valid license, a selected FedX repository and a page that works only with GraphDB repositories
      givenLicense(true);
      const fedx = new Repository({...createRepository('fedx', 'graphdb:FedXRepository'), type: RepositoryType.FEDX});
      const graphdb = new Repository({...createRepository('graphdb'), type: RepositoryType.GRAPH_DB});
      await givenRepositories([fedx, graphdb], fedx);
      givenDeclaredRestrictions([ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED, ViewRestrictionCondition.IS_FEDEX], [RepositoryType.GRAPH_DB]);

      // WHEN: rendering the page
      await render();

      // THEN: the FedX warning should be shown instead of the select repository message
      const messages = getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain(FEDX_UNSUPPORTED);
      // AND: only the allowed repository should be offered in the picker
      expect(getPickerRepositoryIds()).toEqual(['graphdb']);
    });

    it('should show only the no write permission warning when write is also declared', async () => {
      // GIVEN: a valid license, a user who cannot write to the selected Ontop repository but can write to another one
      givenLicense(true);
      givenSecuredUser(['READ_REPO_ontop', 'READ_REPO_other', 'WRITE_REPO_other']);
      const repository = createRepository('ontop', 'graphdb:OntopRepository');
      await givenRepositories([repository, createRepository('other')], repository);
      givenDeclaredRestrictions([ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS, ViewRestrictionCondition.IS_ONTOP]);

      // WHEN: rendering the page
      await render();

      // THEN: only the no write permission warning should be shown
      const messages = getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain(NO_WRITE_PERMISSION);
    });
  });

  describe('when the page declares the repository not selected restriction', () => {
    it('should offer to create a repository even if the repository list is not loaded', async () => {
      // GIVEN: a valid license, a repository manager, no loaded repository list and no selected repository
      givenLicense(true);
      givenSecuredUser(['ROLE_REPO_MANAGER']);
      givenDeclaredRestrictions([ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED]);

      // WHEN: rendering the page
      await render();

      // THEN: the create repository button should be offered in the picker
      expect(fixture.nativeElement.querySelector('.create-repository-btn')).not.toBeNull();
    });

    it('should show only to select a repository when the license is invalid', async () => {
      // GIVEN: an invalid license, a repository manager and no selected repository
      givenLicense(false);
      givenSecuredUser(['ROLE_REPO_MANAGER']);
      await givenRepositories([createRepository('repo')]);
      givenDeclaredRestrictions([ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED]);

      // WHEN: rendering the page
      await render();

      // THEN: the message should only offer to select a repository
      expect(getMessages()).toEqual([SELECT_REPOSITORY]);
      // AND: the repository should be selectable, but the create repository button should not be offered
      expect(fixture.nativeElement.querySelectorAll('.select-repository-btn')).toHaveLength(1);
      expect(fixture.nativeElement.querySelector('.create-repository-btn')).toBeNull();
    });

    it('should show the allowed repositories when the selected repository lacks the required permission', async () => {
      // GIVEN: a valid license, a user who can read one repository and maintain another, with the read-only one selected
      givenLicense(true);
      givenSecuredUser(['READ_REPO_readable', 'READ_REPO_maintained', 'WRITE_REPO_maintained']);
      const readable = createRepository('readable');
      await givenRepositories([readable, createRepository('maintained')], readable);
      givenDeclaredRestrictions([ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED], [], RepositoryPermissionType.WRITE);

      // WHEN: rendering the page
      await render();

      // THEN: the page should ask to select a repository, as the selected one is not suitable
      expect(getMessages()).toEqual([expect.stringContaining(NOT_CONNECTED_TO_REPOSITORY)]);
      // AND: only the repository with the required permission should be offered in the picker
      expect(getPickerRepositoryIds()).toEqual(['maintained']);
    });

    it('should show the allowed repositories when the selected repository does not meet the page requirements', async () => {
      // GIVEN: a valid license, a selected GraphDB repository and a page that works only with Ontop repositories
      givenLicense(true);
      const graphdb = new Repository({...createRepository('graphdb'), type: RepositoryType.GRAPH_DB});
      const ontop = new Repository({...createRepository('ontop'), type: RepositoryType.ONTOP});
      await givenRepositories([graphdb, ontop], graphdb);
      givenDeclaredRestrictions([], [RepositoryType.ONTOP]);

      // WHEN: rendering the page
      await render();

      // THEN: the page should require repository selection because the selected repository is not allowed
      expect(getMessages()).toEqual([expect.stringContaining(NOT_CONNECTED_TO_REPOSITORY)]);
      // AND: only the allowed repository should be offered in the picker
      expect(getPickerRepositoryIds()).toEqual(['ontop']);
    });
  });
});
