import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Repository, RepositoryContextService, RepositoryList, RepositoryType, service} from '@ontotext/workbench-api';

import {RepositoryPickerListComponent} from './repository-picker-list.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {resetWorkbenchContexts} from '../../../testing-utils/workbench-context-testing-utils';

const STATE_FILTER_SELECTOR = '.filter-state [role="combobox"]';

describe('RepositoryPickerListComponent', () => {
  let fixture: ComponentFixture<RepositoryPickerListComponent>;
  let picker: HTMLElement;
  const repositoryContextService = service(RepositoryContextService);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepositoryPickerListComponent, provideTranslocoForTesting()],
    }).compileComponents();
  });

  afterEach(async () => {
    await resetWorkbenchContexts();
  });

  const render = () => {
    fixture = TestBed.createComponent(RepositoryPickerListComponent);
    fixture.detectChanges();
    picker = fixture.nativeElement;
  };

  it('should name the state filter for assistive technologies', () => {
    // GIVEN: there is a repository to pick
    repositoryContextService.updateRepositoryList(new RepositoryList([new Repository({id: 'repo-a', title: 'repo-a'})]));

    // WHEN: rendering the picker with its default filters
    render();

    // THEN: the state filter has an accessible name
    expect(picker.querySelector(STATE_FILTER_SELECTOR)?.getAttribute('aria-label')).toBe('Filter by state');
  });

  it('should mark only FedX repositories as deprecated', () => {
    // GIVEN: there is a FedX and a GraphDB repository to pick
    repositoryContextService.updateRepositoryList(new RepositoryList([
      new Repository({id: 'fedx-repo', type: RepositoryType.FEDX, sesameType: 'graphdb:FedXRepository'}),
      new Repository({id: 'graphdb-repo', type: RepositoryType.GRAPH_DB}),
    ]));

    // WHEN: rendering the picker
    render();

    // THEN: only the FedX repository has the deprecated tag
    const deprecatedTags = Array.from(picker.querySelectorAll('[data-test="repository-picker-fedx-deprecated-tag"]'));
    expect(deprecatedTags.map((tag) => tag.closest('[data-test="repository-picker-row"]')
      ?.querySelector('[data-test="repository-picker-repository-id"]')?.textContent?.trim())).toEqual(['fedx-repo']);
  });
});
