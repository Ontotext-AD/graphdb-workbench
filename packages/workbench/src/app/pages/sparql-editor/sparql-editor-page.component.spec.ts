import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {SparqlEditorPageComponent} from './sparql-editor-page.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {provideRouter} from '@angular/router';
import {DialogService} from 'primeng/dynamicdialog';
import {ConfirmationService} from 'primeng/api';
import {mockResizeObserverForTesting} from '../../../testing-utils/resize-observer-testing-utils';
import {
  ConnectorCheckResult,
  ConnectorCommand,
  ConnectorsService,
  NamespaceMap,
  NamespacesService,
  Repository,
  RepositoryContextService,
  RepositoryList,
  RepositoryStorageService,
  RestrictionContextService,
  service,
} from '@ontotext/workbench-api';
import {BeforeUpdateQueryStatus} from '../../components/yasgui-component-facade/models/yasgui/before-update-query-result';

describe('SparqlEditorPageComponent', () => {
  let component: SparqlEditorPageComponent;
  let fixture: ComponentFixture<SparqlEditorPageComponent>;

  mockResizeObserverForTesting();

  beforeEach(async () => {
    jest.spyOn(service(RepositoryStorageService), 'getActiveRepositoryId').mockReturnValue('test-repo');
    jest.spyOn(service(ConnectorsService), 'getConnectorBuildStatus').mockResolvedValue(null);

    await TestBed.configureTestingModule({
      imports: [
        SparqlEditorPageComponent,
        provideTranslocoForTesting(),
      ],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        DialogService,
        ConfirmationService
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SparqlEditorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('before an update query', () => {
    const connector = {connectorType: 'lucene', pluginName: 'lucene-plugin', name: 'my_index', iri: 'urn:connector'};

    const repositoryContextService = service(RepositoryContextService);

    beforeEach(async () => {
      // Given a selected repository, so that the editor is configured
      jest.spyOn(service(NamespacesService), 'getNamespaces').mockResolvedValue(new NamespaceMap({}));
      const repository = new Repository({id: 'test-repo', location: ''});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository.toRepositoryReference());
      await fixture.whenStable();
    });

    afterEach(async () => {
      await repositoryContextService.updateSelectedRepository(undefined);
      repositoryContextService.updateRepositoryList(new RepositoryList());
    });

    const checkUpdate = () => component.yasguiConfig()!.beforeUpdateQuery!('INSERT DATA {}', 'tab-1');

    it('should let the update run without a message when it is not a connector command', async () => {
      // Given the update is not a connector command
      jest.spyOn(service(ConnectorsService), 'checkConnector')
        .mockResolvedValue(new ConnectorCheckResult({...connector, hasSupport: true}));

      // When the editor checks the update
      const result = await checkUpdate();

      // Then the update runs and no message is shown
      expect(result).toEqual({status: BeforeUpdateQueryStatus.SUCCESS});
    });

    it('should let the update run without a message when it is not a connector command and no plugin serves it', async () => {
      // Given the update is not a connector command and has no support
      jest.spyOn(service(ConnectorsService), 'checkConnector')
        .mockResolvedValue(new ConnectorCheckResult({...connector, hasSupport: false}));

      // When the editor checks the update
      const result = await checkUpdate();

      // Then the update runs and no message is shown
      expect(result).toEqual({status: BeforeUpdateQueryStatus.SUCCESS});
    });

    it('should stop the update with a message when the plugin of the connector is not active', async () => {
      // Given a connector command for a connector type whose plugin is not active
      jest.spyOn(service(ConnectorsService), 'checkConnector')
        .mockResolvedValue(new ConnectorCheckResult({...connector, command: ConnectorCommand.CREATE, hasSupport: false}));

      // When the editor checks the update
      const result = await checkUpdate();

      // Then the update is stopped with a message naming the connector type and the plugin
      expect(result).toEqual({
        status: BeforeUpdateQueryStatus.ERROR,
        messageLabelKey: 'sparql_editor.connector.plugin_inactive',
        parameters: [{key: 'connectorType', value: 'lucene'}, {key: 'pluginName', value: 'lucene-plugin'}],
      });
    });

    it.each([
      [ConnectorCommand.CREATE, 'sparql_editor.connector.created'],
      [ConnectorCommand.REPAIR, 'sparql_editor.connector.repaired'],
      [ConnectorCommand.DROP, 'sparql_editor.connector.deleted'],
    ])('should let the %s connector command run with the %s message', async (command, messageLabelKey) => {
      // Given a connector command for a connector type whose plugin is active
      jest.spyOn(service(ConnectorsService), 'checkConnector')
        .mockResolvedValue(new ConnectorCheckResult({...connector, command, hasSupport: true}));

      // When the editor checks the update
      const result = await checkUpdate();

      // Then the update runs with a message naming the connector
      expect(result).toEqual({
        status: BeforeUpdateQueryStatus.SUCCESS,
        messageLabelKey,
        parameters: [{key: 'name', value: 'my_index'}],
      });
    });
  });

  describe('when the view is restricted', () => {
    const repositoryContextService = service(RepositoryContextService);
    const restrictionContextService = service(RestrictionContextService);
    const readableRepository = new Repository({id: 'readable-repo', location: ''});
    const restrictedRepository = new Repository({id: 'restricted-repo', location: ''});
    let unsubscribeRestriction: () => void;
    let getNamespaces: jest.SpyInstance;

    beforeEach(async () => {
      // Given the restriction is recalculated on a repository change before the page hears of it, as at bootstrap
      fixture.destroy();
      unsubscribeRestriction = repositoryContextService.onSelectedRepositoryChanged((repository) =>
        restrictionContextService.updateIsViewRestricted(repository?.id === restrictedRepository.id));
      repositoryContextService.updateRepositoryList(new RepositoryList([readableRepository, restrictedRepository]));
      fixture = TestBed.createComponent(SparqlEditorPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      getNamespaces = jest.spyOn(service(NamespacesService), 'getNamespaces').mockResolvedValue(new NamespaceMap({}));
      // And the page is open on a repository the user cannot read, so it doesn't load
      await repositoryContextService.updateSelectedRepository(restrictedRepository.toRepositoryReference());
      await fixture.whenStable();
    });

    afterEach(async () => {
      unsubscribeRestriction();
      await repositoryContextService.updateSelectedRepository(undefined);
      restrictionContextService.updateIsViewRestricted(false);
      repositoryContextService.updateRepositoryList(new RepositoryList());
    });

    it('should load the view once when a readable repository is selected', async () => {
      // When the user selects a repository they can read
      await repositoryContextService.updateSelectedRepository(readableRepository.toRepositoryReference());
      await fixture.whenStable();

      // Then the view loads once
      expect(getNamespaces).toHaveBeenCalledTimes(1);
    });

    it('should not clear the results when the user comes back from a repository they cannot read', async () => {
      // Given the view is loaded for a repository the user can read
      await repositoryContextService.updateSelectedRepository(readableRepository.toRepositoryReference());
      await fixture.whenStable();

      // When the user opens a repository they cannot read and then goes back
      await repositoryContextService.updateSelectedRepository(restrictedRepository.toRepositoryReference());
      await fixture.whenStable();
      await repositoryContextService.updateSelectedRepository(readableRepository.toRepositoryReference());
      await fixture.whenStable();

      // Then the editor doesn't clear the results of that repository
      expect(component.yasguiConfig()?.clearState).toBe(false);
    });

    it('should load the view when the restriction is lifted for the selected repository', async () => {
      // When the restriction is lifted without a repository change, e.g. the user gets read access
      restrictionContextService.updateIsViewRestricted(false);
      await fixture.whenStable();

      // Then the view loads once
      expect(getNamespaces).toHaveBeenCalledTimes(1);
    });
  });
});
