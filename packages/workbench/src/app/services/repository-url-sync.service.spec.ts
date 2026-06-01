import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {
  getCurrentRoute,
  OntoToastrService,
  RepositoryContextService,
  service,
  WindowService,
} from '@ontotext/workbench-api';
import {ConfirmationService} from 'primeng/api';
import {RepositoryUrlSyncService} from './repository-url-sync.service';
import {ConfirmationProviderService} from './dialog/confirmation-provider.service';
import {TranslocoService} from '@jsverse/transloco';

jest.mock('@ontotext/workbench-api', () => ({
  ...jest.requireActual('@ontotext/workbench-api'),
  service: jest.fn(),
  getCurrentRoute: jest.fn().mockReturnValue('sparql'),
}));

const mockService = service as jest.MockedFunction<typeof service>;
const mockGetCurrentRoute = getCurrentRoute as jest.MockedFunction<typeof getCurrentRoute>;

describe('RepositoryUrlSyncService', () => {
  let syncService: RepositoryUrlSyncService;
  let mockNavigate: jest.Mock;
  let mockConfirm: jest.Mock;
  let mockConfirmOnly: jest.Mock;
  let mockGetSelectedRepository: jest.Mock;
  let mockRepositoryExists: jest.Mock;
  let mockUpdateSelectedRepository: jest.Mock;
  let mockGetLocationQueryParams: jest.SpyInstance;

  const REPO_ID_PARAM = 'repositoryId';

  const setUrlParam = (repoId: string | null) => {
    const search = repoId ? `?${REPO_ID_PARAM}=${repoId}` : '';
    mockGetLocationQueryParams.mockReturnValue(search);
  };

  beforeEach(() => {
    mockNavigate = jest.fn().mockResolvedValue(true);
    mockConfirm = jest.fn();
    mockConfirmOnly = jest.fn();
    mockGetSelectedRepository = jest.fn().mockReturnValue(undefined);
    mockRepositoryExists = jest.fn().mockReturnValue(false);
    mockUpdateSelectedRepository = jest.fn().mockResolvedValue(undefined);

    mockService.mockImplementation((serviceClass: unknown) => {
      if (serviceClass === RepositoryContextService) {
        return {
          getSelectedRepository: mockGetSelectedRepository,
          repositoryExists: mockRepositoryExists,
          updateSelectedRepository: mockUpdateSelectedRepository,
        } as unknown as ReturnType<typeof service>;
      }
      if (serviceClass === OntoToastrService) {
        return {} as unknown as ReturnType<typeof service>;
      }
      return {} as unknown as ReturnType<typeof service>;
    });

    mockGetLocationQueryParams = jest.spyOn(WindowService, 'getLocationQueryParams').mockReturnValue('');

    TestBed.configureTestingModule({
      providers: [
        RepositoryUrlSyncService,
        ConfirmationService,
        {provide: Router, useValue: {navigate: mockNavigate}},
        {provide: ActivatedRoute, useValue: {}},
        {provide: ConfirmationProviderService, useValue: {confirm: mockConfirm, confirmOnly: mockConfirmOnly}},
        {provide: TranslocoService, useValue: {translate: (key: string) => key}},
      ],
    });

    syncService = TestBed.inject(RepositoryUrlSyncService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(syncService).toBeTruthy();
  });

  describe('#syncRepositoryIdWithUrl', () => {
    describe('Scenario 1 – no active repo, no URL param → no action', () => {
      it('should not call any dialog or navigation', () => {
        mockGetSelectedRepository.mockReturnValue(undefined);
        setUrlParam(null);

        syncService.syncRepositoryIdWithUrl();

        expect(mockConfirm).not.toHaveBeenCalled();
        expect(mockConfirmOnly).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockUpdateSelectedRepository).not.toHaveBeenCalled();
      });
    });

    describe('Scenario 2 – no active repo, URL param present, repo exists → set active repo', () => {
      it('should call updateSelectedRepository with the URL param repo id', () => {
        mockGetSelectedRepository.mockReturnValue(undefined);
        setUrlParam('myRepo');
        mockRepositoryExists.mockReturnValue(true);

        syncService.syncRepositoryIdWithUrl();

        expect(mockUpdateSelectedRepository).toHaveBeenCalledWith({id: 'myRepo', location: ''});
      });

      it('should not show any dialog', () => {
        mockGetSelectedRepository.mockReturnValue(undefined);
        setUrlParam('myRepo');
        mockRepositoryExists.mockReturnValue(true);

        syncService.syncRepositoryIdWithUrl();

        expect(mockConfirm).not.toHaveBeenCalled();
        expect(mockConfirmOnly).not.toHaveBeenCalled();
      });
    });

    describe('Scenario 3 – no active repo, URL param present, repo missing → show warning dialog', () => {
      it('should call confirmOnly with a warning header and message', () => {
        mockGetSelectedRepository.mockReturnValue(undefined);
        setUrlParam('unknownRepo');
        mockRepositoryExists.mockReturnValue(false);

        syncService.syncRepositoryIdWithUrl();

        expect(mockConfirmOnly).toHaveBeenCalledTimes(1);
        expect(mockConfirmOnly).toHaveBeenCalledWith(
          expect.objectContaining({
            header: 'common.warnings.warning',
            message: 'repository.url_param.invalid_repo',
          })
        );
      });

      it('should not navigate or update the selected repository', () => {
        mockGetSelectedRepository.mockReturnValue(undefined);
        setUrlParam('unknownRepo');
        mockRepositoryExists.mockReturnValue(false);

        syncService.syncRepositoryIdWithUrl();

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockUpdateSelectedRepository).not.toHaveBeenCalled();
      });
    });

    describe('Scenario 4 – active repo, no URL param → write repo id to URL', () => {
      it('should navigate with the active repository id as a query param', () => {
        mockGetSelectedRepository.mockReturnValue({id: 'activeRepo', location: ''});
        setUrlParam(null);

        syncService.syncRepositoryIdWithUrl();

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(
          [mockGetCurrentRoute()],
          expect.objectContaining({
            queryParams: expect.objectContaining({[REPO_ID_PARAM]: 'activeRepo'}),
            replaceUrl: true,
          })
        );
      });

      it('should not show any dialog', () => {
        mockGetSelectedRepository.mockReturnValue({id: 'activeRepo', location: ''});
        setUrlParam(null);

        syncService.syncRepositoryIdWithUrl();

        expect(mockConfirm).not.toHaveBeenCalled();
        expect(mockConfirmOnly).not.toHaveBeenCalled();
      });
    });

    describe('Scenario 5 – active repo, URL param is same repo → no action', () => {
      it('should not call any dialog or navigation', () => {
        mockGetSelectedRepository.mockReturnValue({id: 'myRepo', location: ''});
        setUrlParam('myRepo');
        mockRepositoryExists.mockReturnValue(true);

        syncService.syncRepositoryIdWithUrl();

        expect(mockConfirm).not.toHaveBeenCalled();
        expect(mockConfirmOnly).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockUpdateSelectedRepository).not.toHaveBeenCalled();
      });
    });

    describe('Scenario 6 – active repo, URL param is a different existing repo → confirm change', () => {
      it('should call confirm with a change confirmation dialog', () => {
        mockGetSelectedRepository.mockReturnValue({id: 'currentRepo', location: ''});
        setUrlParam('newRepo');
        mockRepositoryExists.mockReturnValue(true);

        syncService.syncRepositoryIdWithUrl();

        expect(mockConfirm).toHaveBeenCalledTimes(1);
        expect(mockConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            header: 'components.dialog.confirmation.title',
            message: 'repository.url_param.change_active_repo',
          })
        );
      });

      it('should call updateSelectedRepository with the new repo id when accepted', () => {
        mockGetSelectedRepository.mockReturnValue({id: 'currentRepo', location: ''});
        setUrlParam('newRepo');
        mockRepositoryExists.mockReturnValue(true);
        mockConfirm.mockImplementation(({acceptHandler}: {acceptHandler: () => void}) => acceptHandler());

        syncService.syncRepositoryIdWithUrl();

        expect(mockUpdateSelectedRepository).toHaveBeenCalledWith({id: 'newRepo', location: ''});
      });

      it('should revert URL to current repo when rejected', () => {
        mockGetSelectedRepository.mockReturnValue({id: 'currentRepo', location: ''});
        setUrlParam('newRepo');
        mockRepositoryExists.mockReturnValue(true);
        mockConfirm.mockImplementation(({rejectHandler}: {rejectHandler: () => void}) => rejectHandler());

        syncService.syncRepositoryIdWithUrl();

        expect(mockNavigate).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            queryParams: expect.objectContaining({[REPO_ID_PARAM]: 'currentRepo'}),
          })
        );
      });
    });

    describe('Scenario 7 – active repo, URL param repo not found anywhere → warn and fix URL', () => {
      it('should call confirmOnly with invalid_repo_continue message key', () => {
        mockGetSelectedRepository.mockReturnValue({id: 'currentRepo', location: ''});
        setUrlParam('ghostRepo');
        // repositoryExists returns false for both exact and ignore-location checks
        mockRepositoryExists.mockReturnValue(false);

        syncService.syncRepositoryIdWithUrl();

        expect(mockConfirmOnly).toHaveBeenCalledTimes(1);
        expect(mockConfirmOnly).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'repository.url_param.invalid_repo_continue',
          })
        );
      });

      it('should fix the URL to the current repo when the user accepts', () => {
        mockGetSelectedRepository.mockReturnValue({id: 'currentRepo', location: ''});
        setUrlParam('ghostRepo');
        mockRepositoryExists.mockReturnValue(false);
        mockConfirmOnly.mockImplementation(({acceptHandler}: {acceptHandler: () => void}) => acceptHandler());

        syncService.syncRepositoryIdWithUrl();

        expect(mockNavigate).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            queryParams: expect.objectContaining({[REPO_ID_PARAM]: 'currentRepo'}),
          })
        );
      });
    });

    describe('Scenario 8 – active repo, URL param repo found by id (remote location) → shows warning on first resolution', () => {
      it('should call confirmOnly with remote_location_repo_continue when isFirstResolution is true (default)', () => {
        mockGetSelectedRepository.mockReturnValue({id: 'currentRepo', location: ''});
        setUrlParam('remoteRepo');
        // First call (exact match) returns false, second call (ignoreLocation) returns true
        mockRepositoryExists
          .mockReturnValueOnce(false)  // exact match → not found
          .mockReturnValueOnce(true);  // ignore location → found (remote)

        syncService.syncRepositoryIdWithUrl();

        expect(mockConfirm).not.toHaveBeenCalled();
        expect(mockConfirmOnly).toHaveBeenCalledTimes(1);
        expect(mockConfirmOnly).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'repository.url_param.remote_location_repo_continue',
          })
        );
      });
    });
  });

  describe('#onRepositoryChanged', () => {
    it('should navigate with the new repo id when it differs from the URL param', () => {
      setUrlParam('oldRepo');

      syncService.onRepositoryChanged('newRepo');

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(
        [mockGetCurrentRoute()],
        expect.objectContaining({
          queryParams: expect.objectContaining({[REPO_ID_PARAM]: 'newRepo'}),
          replaceUrl: true,
        })
      );
    });

    it('should not navigate when the new repo id matches the URL param', () => {
      setUrlParam('sameRepo');

      syncService.onRepositoryChanged('sameRepo');

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should navigate when there is no repo id in the URL', () => {
      setUrlParam(null);

      syncService.onRepositoryChanged('newRepo');

      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
