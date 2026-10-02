import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  License,
  LicenseContextService,
  Repository,
  RepositoryContextService,
  RepositoryList,
  RepositoryPermissionType,
  RepositoryType,
  RestrictionContextService,
  SecurityContextService,
  service,
  ViewRestriction,
  ViewRestrictionCondition,
} from '@ontotext/workbench-api';

import { PageRestrictionsComponent } from './page-restrictions.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {mockResizeObserverForTesting} from '../../../testing-utils/resize-observer-testing-utils';
import {createAuthenticatedUser, createSecurityConfig, resetWorkbenchContexts} from '../../../testing-utils/workbench-context-testing-utils';
import {normalizeText} from '../../../testing-utils/text-testing-utils';
import {PAGE_LAYOUT_RESTRICTIONS_SELECTORS} from '../../../testing-utils/page-restrictions/selectors';

const NOT_CONNECTED_TO_REPOSITORY = 'you are not connected to any repository';

const createRepository = (id: string) => new Repository({
  id,
  title: id,
  location: '',
  uri: `http://${id}`,
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
    await resetWorkbenchContexts();
  });

  const givenLicense = (valid: boolean) => {
    licenseContextService.updateGraphdbLicense(new License({valid}));
  };

  const givenSecuredUser = (authorities: string[]) => {
    securityContextService.updateAuthenticatedUser(createAuthenticatedUser('user', authorities));
    securityContextService.updateSecurityConfig(createSecurityConfig(true));
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

  const getTexts = (selector: string): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll(selector) as NodeListOf<HTMLElement>)
      .map((element) => normalizeText(element.textContent));

  const getMessages = (): string[] => getTexts(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.restrictionMessage);

  const getPickerRepositoryIds = (): string[] => getTexts(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.pickerRepositoryId);

  describe('when the page declares the repository not selected restriction', () => {
    it('should offer to create a repository even if the repository list is not loaded', async () => {
      // GIVEN: a valid license, a repository manager, no loaded repository list and no selected repository
      givenLicense(true);
      givenSecuredUser(['ROLE_REPO_MANAGER']);
      givenDeclaredRestrictions([ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED]);

      // WHEN: rendering the page
      await render();

      // THEN: the create repository button should be offered in the picker
      expect(fixture.nativeElement.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.createRepositoryButton)).not.toBeNull();
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
