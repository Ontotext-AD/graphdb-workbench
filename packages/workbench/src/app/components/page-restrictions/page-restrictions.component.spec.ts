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

const NOT_CONNECTED_TO_REPOSITORY = 'you are not connected to any repository';

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
  });
});
