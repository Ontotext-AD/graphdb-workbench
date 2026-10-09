import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {TranslocoService} from '@jsverse/transloco';
import {
  License,
  LicenseContextService,
  RepositoryContextService,
  RepositoryList,
  RestrictionContextService,
  RestrictionService,
  SecurityContextService,
  service,
  ViewRestriction,
  WindowService,
} from '@ontotext/workbench-api';

import {PageLayoutComponent} from './page-layout.component';
import {ExpectedViewRestrictionTestMessage, ViewRestrictionTestScenario} from './test/view-restriction-test-scenario-builder';
import {
  ALL_LOCAL_REPOSITORY_IDS,
  getAllRestrictionsDeclaredNoneAppliesScenario,
  getNoRepositorySelectedWithCreateRightsScenario,
  getNoRepositorySelectedWithRemoteLocationScenario,
  getScenarios,
  getSelectedRepositoryOfNotAllowedTypeScenario,
  REMOTE_REPO_ID,
  REPO_A_ID,
  REPO_B_ID,
  USERS,
} from './test/view-restriction-test-scenarios';
import {PAGE_LAYOUT_RESTRICTIONS_SELECTORS} from '../../../testing-utils/page-restrictions/selectors';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {mockResizeObserverForTesting} from '../../../testing-utils/resize-observer-testing-utils';
import {getTextWithoutLinks, htmlToPlainText, normalizeText} from '../../../testing-utils/text-testing-utils';
import {createAuthenticatedUser, createSecurityConfig, resetWorkbenchContexts} from '../../../testing-utils/workbench-context-testing-utils';

const PAGE_TITLE_KEY = 'graph_navigator.title';

@Component({
  imports: [PageLayoutComponent],
  template: '<app-page-layout><div data-test="view-content">Page content</div></app-page-layout>'
})
class PageLayoutHostComponent {}

describe('PageLayoutComponent restrictions', () => {
  let fixture: ComponentFixture<PageLayoutHostComponent>;
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
    jest.restoreAllMocks();
    await resetWorkbenchContexts();
  });

  const givenScenario = async (scenario: ViewRestrictionTestScenario) => {
    if (scenario.license !== 'missing') {
      licenseContextService.updateGraphdbLicense(new License({valid: scenario.license === 'valid'}));
    }
    securityContextService.updateSecurityConfig(createSecurityConfig(!!scenario.user));
    if (scenario.user) {
      securityContextService.updateAuthenticatedUser(createAuthenticatedUser(scenario.user, USERS[scenario.user]));
    }
    repositoryContextService.updateRepositoryList(new RepositoryList(scenario.repositories));
    await repositoryContextService.updateSelectedRepository(scenario.selectedRepository);
    restrictionContextService.updateViewRestriction(new ViewRestriction(scenario.restrictions, scenario.allowedRepositoryTypes));
  };

  const render = async () => {
    fixture = TestBed.createComponent(PageLayoutHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    page = fixture.nativeElement;
  };

  const selectRepositoryInPicker = async (repositoryId: string) => {
    Array.from(page.querySelectorAll<HTMLElement>(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.pickerRepositoryId))
      .find((idElement) => normalizeText(idElement.textContent) === repositoryId)
      ?.click();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  // Injected lazily, because injecting in beforeEach would prevent tests from overriding providers.
  const translate = (key: string, params?: Record<string, string>): string =>
    TestBed.inject(TranslocoService).translate(key, params);

  const toExpectedText = (message: ExpectedViewRestrictionTestMessage): string =>
    htmlToPlainText(translate(`components.page_restrictions.${message.key}`, message.params));

  const getMessages = (): HTMLElement[] => Array.from(page.querySelectorAll<HTMLElement>(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.restrictionMessage));

  const getPickerRepositoryIds = (): string[] =>
    Array.from(page.querySelectorAll(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.pickerRepositoryId)).map((element) => normalizeText(element.textContent));

  const getPickerRepositoryLocations = (): {id: string, location: string}[] =>
    Array.from(page.querySelectorAll(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.pickerRepositoryId)).map((idElement) => ({
      id: normalizeText(idElement.textContent),
      location: normalizeText(idElement.closest('tr')?.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.repositoryLocation)?.textContent),
    }));

  const isViewContentShown = (): boolean => page.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.viewContent) !== null;

  const areRestrictionsShown = (): boolean => page.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.pageRestrictions) !== null;

  const isRepositoryPickerShown = (): boolean => page.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.repositoryPicker) !== null;

  const isCreateRepositoryButtonShown = (): boolean => page.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.createRepositoryButton) !== null;

  it.each(getScenarios())('$description', async (scenario) => {
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
    const setNewLicenseLabel = translate('components.page_restrictions.set_new_license');
    getMessages().forEach((message, index) => {
      const link = message.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.restrictionLink);
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

  it('should select the repository and show the view content when a repository is selected in the picker', async () => {
    // GIVEN: a page that requires a selected repository, and no repository is selected
    await givenScenario(getNoRepositorySelectedWithCreateRightsScenario());
    await render();

    // WHEN: selecting a repository in the picker
    await selectRepositoryInPicker(REPO_B_ID);

    // THEN: the repository becomes the selected one
    expect(repositoryContextService.getSelectedRepository()?.id).toBe(REPO_B_ID);
    // AND: the restrictions are cleared and the view content is shown
    expect(areRestrictionsShown()).toBe(false);
    expect(isViewContentShown()).toBe(true);
  });

  it('should open the create repository page, with a way back to the current page, when creating a repository', async () => {
    // GIVEN: a user who can create repositories opens a page that requires a selected repository, and no repository is
    // selected
    jest.spyOn(WindowService, 'getLocationPathname').mockReturnValue('/graph-navigator');
    const navigateSingleSpa = jest.spyOn(WindowService, 'navigateSingleSpa').mockImplementation(() => undefined);
    await givenScenario(getNoRepositorySelectedWithCreateRightsScenario());
    await render();

    // WHEN: clicking the create repository button
    page.querySelector<HTMLButtonElement>(`${PAGE_LAYOUT_RESTRICTIONS_SELECTORS.createRepositoryButton} button`)?.click();

    // THEN: the create repository page is opened, with the current page to return to after the repository is created
    expect(navigateSingleSpa).toHaveBeenCalledTimes(1);
    const url = new URL(navigateSingleSpa.mock.calls[0][0]);
    expect(url.pathname).toBe('/repository/create');
    expect(url.searchParams.get('previous')).toBe('/graph-navigator');
  });

  it('should offer only the local repositories, without their location', async () => {
    // GIVEN: an attached remote location with a repository
    await givenScenario(getNoRepositorySelectedWithRemoteLocationScenario());

    // WHEN: rendering the page
    await render();

    // THEN: the "Local only" filter is checked
    expect(page.querySelector<HTMLInputElement>(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.localOnlyFilter)?.checked).toBe(true);
    // AND: only the local repositories are offered
    expect(getPickerRepositoryIds()).toEqual(ALL_LOCAL_REPOSITORY_IDS);
    // AND: the location is not shown, because all offered repositories are local
    expect(page.querySelectorAll(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.repositoryLocation)).toHaveLength(0);
  });

  it('should offer each repository as a button named after the repository and its location', async () => {
    // GIVEN: an attached remote location with a repository, and the picker offers only the local repositories
    await givenScenario(getNoRepositorySelectedWithRemoteLocationScenario());
    await render();

    // WHEN: unchecking "Local only"
    page.querySelector<HTMLInputElement>(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.localOnlyFilter)!.click();
    fixture.detectChanges();

    // THEN: each repository is offered as a native, enabled button
    const selectControls = Array.from(page.querySelectorAll<HTMLButtonElement>(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.pickerSelectButton));
    selectControls.forEach((selectControl) => {
      expect(selectControl.tagName).toBe('BUTTON');
      expect(selectControl.type).toBe('button');
      expect(selectControl.disabled).toBe(false);
    });
    // AND: the accessible name of each button says which repository, at which location, it selects
    const toExpectedAccessibleName = (repositoryId: string, location: string): string =>
      translate('components.repository_picker_list.select_repository_aria_label', {repositoryId, location});
    const localLocation = translate('components.repository_picker_list.location_local_label');
    expect(selectControls.map((selectControl) => selectControl.getAttribute('aria-label'))).toEqual([
      ...ALL_LOCAL_REPOSITORY_IDS.map((id) => toExpectedAccessibleName(id, localLocation)),
      toExpectedAccessibleName(REMOTE_REPO_ID, 'https://remote-host:7200'),
    ]);
  });

  it('should tell the state and the type of a repository to assistive technologies', async () => {
    // GIVEN: a list of repositories, the first of which is a starting FedX repository
    await givenScenario(getNoRepositorySelectedWithCreateRightsScenario());

    // WHEN: rendering the page
    await render();

    // THEN: the state icon of the repository is decorative, and the state is told by a text next to it
    const stateIcon = page.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.pickerRepositoryState);
    const stateLabel = page.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.pickerRepositoryStateLabel);
    expect(stateIcon?.getAttribute('aria-hidden')).toBe('true');
    expect(stateLabel?.textContent?.trim()).toBe('Starting');
    // AND: the button of the repository is described by that text
    const selectControl = page.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.pickerSelectButton);
    expect(selectControl?.getAttribute('aria-describedby')).toBe(stateLabel?.id);
    // AND: the type icon of the repository is decorative, and the type is told by a text next to it
    const typeIcon = page.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.pickerRepositoryType);
    const typeLabel = page.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.pickerRepositoryTypeLabel);
    expect(typeIcon?.getAttribute('aria-hidden')).toBe('true');
    expect(typeLabel?.textContent?.trim()).toBe('FedX repository');
  });

  it('should name the picker name filter for assistive technologies', async () => {
    // GIVEN: a page that requires a selected repository, and no repository is selected
    await givenScenario(getNoRepositorySelectedWithCreateRightsScenario());

    // WHEN: rendering the page
    await render();

    // THEN: the name filter has an accessible name
    expect(page.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.nameFilter)?.getAttribute('aria-label'))
      .toBe('Filter by name or title');
  });

  it('should offer only the repositories that match the text typed in the picker filter', async () => {
    // GIVEN: a page that requires a selected repository, and no repository is selected
    await givenScenario(getNoRepositorySelectedWithCreateRightsScenario());
    await render();

    // WHEN: typing in the picker filter
    const nameFilter = page.querySelector<HTMLInputElement>(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.nameFilter);
    nameFilter!.value = 'REPO-';
    nameFilter!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // THEN: only the repositories whose id or title contains the text, ignoring case, are offered
    expect(getPickerRepositoryIds()).toEqual([REPO_A_ID, REPO_B_ID]);
  });

  it('should also offer the remote repositories, each with its location, when "Local only" is unchecked', async () => {
    // GIVEN: an attached remote location with a repository, and the picker offers only the local repositories
    await givenScenario(getNoRepositorySelectedWithRemoteLocationScenario());
    await render();

    // WHEN: unchecking "Local only"
    page.querySelector<HTMLInputElement>(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.localOnlyFilter)!.click();
    fixture.detectChanges();

    // THEN: the remote repository is offered after the local ones, with its remote location
    const localLocation = `@ ${translate('components.repository_picker_list.location_local_label')}`;
    expect(getPickerRepositoryLocations()).toEqual([
      ...ALL_LOCAL_REPOSITORY_IDS.map((id) => ({id, location: localLocation})),
      {id: REMOTE_REPO_ID, location: '@ https://remote-host:7200'},
    ]);
  });

  it.each([
    getNoRepositorySelectedWithCreateRightsScenario(),
    getAllRestrictionsDeclaredNoneAppliesScenario(),
    getSelectedRepositoryOfNotAllowedTypeScenario(),
  ])('should show the same content when the page is embedded: $description', async (scenario) => {
    // GIVEN: an embedded page and the scenario's license, security, user, repositories and declared restrictions
    TestBed.overrideProvider(ActivatedRoute, {useValue: {snapshot: {queryParams: {embedded: ''}, data: {title: PAGE_TITLE_KEY}}}});
    await givenScenario(scenario);

    // WHEN: rendering the page
    await render();

    // THEN: the page title is hidden, as the page is embedded
    expect(page.querySelector(PAGE_LAYOUT_RESTRICTIONS_SELECTORS.pageTitle)).toBeNull();
    // AND: either the view content or the restrictions are shown, as when the page is not embedded
    expect(isViewContentShown()).toBe(scenario.expected.contentShown);
    expect(areRestrictionsShown()).toBe(!scenario.expected.contentShown);
    expect(getMessages().map(getTextWithoutLinks)).toEqual(scenario.expected.messages.map(toExpectedText));
    expect(getPickerRepositoryIds()).toEqual(scenario.expected.pickerRepositoryIds ?? []);
  });
});
