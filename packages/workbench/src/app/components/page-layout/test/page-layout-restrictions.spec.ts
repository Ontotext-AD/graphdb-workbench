import {TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {TranslocoService} from '@jsverse/transloco';
import {
  AuthenticatedUser,
  AuthorityList,
  License,
  LicenseContextService,
  RepositoryContextService,
  RepositoryList,
  RestrictionContextService,
  RestrictionService,
  SecurityConfig,
  SecurityContextService,
  service,
  ViewRestriction,
} from '@ontotext/workbench-api';

import {PageLayoutComponent} from '../page-layout.component';
import {ExpectedViewRestrictionMessage, ViewRestrictionScenario} from './view-restriction-scenario-builder';
import {ALL_LOCAL_REPOSITORY_IDS, createScenario1, createScenario16, getScenarios, USERS} from './view-restriction-scenarios';
import {SELECTORS} from './page-layout-restrictions-selectors';
import {provideTranslocoForTesting} from '../../../../testing-utils/transloco-utils';
import {mockResizeObserverForTesting} from '../../../../testing-utils/resize-observer-testing-utils';
import {getTextWithoutLinks, htmlToPlainText, normalizeText} from '../../../../testing-utils/text-testing-utils';

const PAGE_TITLE_KEY = 'reactodia.title';

@Component({
  imports: [PageLayoutComponent],
  template: '<app-page-layout><div data-test="view-content">Page content</div></app-page-layout>'
})
class PageLayoutHostComponent {}

describe('PageLayoutComponent restrictions', () => {
  let page: HTMLElement;
  const licenseContextService = service(LicenseContextService);
  const securityContextService = service(SecurityContextService);
  const repositoryContextService = service(RepositoryContextService);
  const restrictionContextService = service(RestrictionContextService);

  mockResizeObserverForTesting();

  beforeAll(() => {
    // Creating the service registers its subscriptions, which keep the restricted state in the context up to date.
    service(RestrictionService);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLayoutHostComponent, provideTranslocoForTesting()],
      providers: [
        provideRouter([]),
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}, data: {title: PAGE_TITLE_KEY}}}},
        provideNoopAnimations()
      ]
    }).compileComponents();
  });

  afterEach(async () => {
    licenseContextService.updateGraphdbLicense(undefined);
    securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
    securityContextService.updateSecurityConfig(undefined as unknown as SecurityConfig);
    await repositoryContextService.updateSelectedRepository(undefined);
    repositoryContextService.updateRepositoryList(undefined as unknown as RepositoryList);
    restrictionContextService.updateViewRestriction(new ViewRestriction());
  });

  const givenScenario = async (scenario: ViewRestrictionScenario) => {
    licenseContextService.updateGraphdbLicense(new License({valid: scenario.licenseValid}));
    securityContextService.updateSecurityConfig(new SecurityConfig({
      enabled: !!scenario.user,
      overrideAuth: {appSettings: {}},
      freeAccess: {appSettings: {}}
    } as unknown as SecurityConfig));
    if (scenario.user) {
      const user = new AuthenticatedUser();
      user.username = scenario.user;
      user.setAuthorities(new AuthorityList(USERS[scenario.user]));
      securityContextService.updateAuthenticatedUser(user);
    }
    repositoryContextService.updateRepositoryList(new RepositoryList(scenario.repositories));
    await repositoryContextService.updateSelectedRepository(scenario.selectedRepository);
    restrictionContextService.updateViewRestriction(new ViewRestriction(scenario.restrictions, scenario.allowedRepositoryTypes));
  };

  const render = async () => {
    const fixture = TestBed.createComponent(PageLayoutHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    page = fixture.nativeElement;
  };

  const toExpectedText = (message: ExpectedViewRestrictionMessage): string =>
    htmlToPlainText(TestBed.inject(TranslocoService).translate(`components.page_restrictions.${message.key}`, message.params));

  const getMessages = (): HTMLElement[] => Array.from(page.querySelectorAll<HTMLElement>(SELECTORS.restrictionMessage));

  const getPickerRepositoryIds = (): string[] =>
    Array.from(page.querySelectorAll(SELECTORS.pickerRepositoryId)).map((element) => normalizeText(element.textContent));

  const isViewContentShown = (): boolean => page.querySelector(SELECTORS.viewContent) !== null;

  const areRestrictionsShown = (): boolean => page.querySelector(SELECTORS.pageRestrictions) !== null;

  const isRepositoryPickerShown = (): boolean => page.querySelector(SELECTORS.repositoryPicker) !== null;

  const isCreateRepositoryButtonShown = (): boolean => page.querySelector(SELECTORS.createRepositoryButton) !== null;

  it.each(getScenarios())('$id: $description', async (scenario) => {
    // GIVEN: the scenario's license, security, user, repositories and declared restrictions
    await givenScenario(scenario);

    // WHEN: rendering the page
    await render();

    // THEN: either the view content or the restrictions are shown
    expect(isViewContentShown()).toBe(scenario.expected.contentShown);
    expect(areRestrictionsShown()).toBe(!scenario.expected.contentShown);

    // AND: the restriction messages are shown in the expected order
    expect(getMessages().map(getTextWithoutLinks)).toEqual(scenario.expected.messages.map(toExpectedText));

    // AND: the "Set a new license" link leads to the license page
    const setNewLicenseLabel = TestBed.inject(TranslocoService).translate('components.page_restrictions.set_new_license');
    getMessages().forEach((message, index) => {
      const link = message.querySelector(SELECTORS.restrictionLink);
      if (scenario.expected.messages[index]?.hasLicenseLink) {
        expect(normalizeText(link?.textContent)).toBe(setNewLicenseLabel);
        expect(link?.getAttribute('href')).toBe('/license');
      } else {
        expect(link).toBeNull();
      }
    });

    // AND: the picker offers the expected repositories
    if (scenario.expected.pickerRepositoryIds) {
      expect(isRepositoryPickerShown()).toBe(true);
      expect(getPickerRepositoryIds()).toEqual(scenario.expected.pickerRepositoryIds);
    } else {
      expect(isRepositoryPickerShown()).toBe(false);
    }

    // AND: the create repository button is offered only when expected
    expect(isCreateRepositoryButtonShown()).toBe(scenario.expected.createButton);
  });

  it('should offer only the local repositories, each with its location', async () => {
    // GIVEN: an attached remote location with a repository
    await givenScenario(createScenario16());

    // WHEN: rendering the page
    await render();

    // THEN: the "Local only" filter is checked
    expect(page.querySelector<HTMLInputElement>(SELECTORS.localOnlyFilter)?.checked).toBe(true);
    // AND: each offered repository shows that it is local
    expect(Array.from(page.querySelectorAll(SELECTORS.repositoryLocation)).map((element) => normalizeText(element.textContent)))
      .toEqual(ALL_LOCAL_REPOSITORY_IDS.map(() => '@ Local'));
  });

  it('should show the restrictions instead of the view content when the page is embedded', async () => {
    // GIVEN: an embedded page, without a selected repository (S1)
    TestBed.overrideProvider(ActivatedRoute, {useValue: {snapshot: {queryParams: {embedded: ''}, data: {title: PAGE_TITLE_KEY}}}});
    const scenario = createScenario1();
    await givenScenario(scenario);

    // WHEN: rendering the page
    await render();

    // THEN: the page title is hidden, as the page is embedded
    expect(page.querySelector(SELECTORS.pageTitle)).toBeNull();
    // AND: the restrictions are shown instead of the view content
    expect(isViewContentShown()).toBe(false);
    expect(getMessages().map(getTextWithoutLinks)).toEqual(scenario.expected.messages.map(toExpectedText));
    expect(getPickerRepositoryIds()).toEqual(scenario.expected.pickerRepositoryIds);
  });
});
