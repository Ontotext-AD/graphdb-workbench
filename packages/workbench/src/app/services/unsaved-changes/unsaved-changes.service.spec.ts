import {TestBed} from '@angular/core/testing';
import {UnsavedChangesService} from './unsaved-changes.service';
import {ConfirmationService} from 'primeng/api';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {EventName, NavigationStartPayload, service} from '@ontotext/workbench-api';

jest.mock('@ontotext/workbench-api', () => ({
  ...jest.requireActual('@ontotext/workbench-api'),
  service: jest.fn()
}));

const mockService = service as jest.MockedFunction<typeof service>;

describe('UnsavedChangesService', () => {
  let unsavedChangesService: UnsavedChangesService;
  let mockSubscribe: jest.Mock;
  let confirmFn: jest.Mock;
  let triggerNavigation: (payload: Partial<NavigationStartPayload>) => Promise<void>;

  const makePayload = (cancelNavigation = jest.fn()): Partial<NavigationStartPayload> => ({
    newUrl: 'http://localhost/new-route',
    cancelNavigation
  });

  beforeEach(() => {
    mockSubscribe = jest.fn();
    confirmFn = jest.fn();
    mockService.mockReturnValue({subscribe: mockSubscribe});

    TestBed.configureTestingModule({
      imports: [provideTranslocoForTesting()],
      providers: [
        UnsavedChangesService,
        {provide: ConfirmationService, useValue: {confirm: confirmFn}}
      ]
    });

    unsavedChangesService = TestBed.inject(UnsavedChangesService);

    const handlerCall = mockSubscribe.mock.calls.find(([name]: [string]) => name === EventName.NAVIGATION_START);
    const handler = handlerCall?.[1] as (payload: NavigationStartPayload) => Promise<void>;
    triggerNavigation = (payload) => handler(payload as NavigationStartPayload);
  });

  it('should be created', () => {
    expect(unsavedChangesService).toBeTruthy();
  });

  it('should subscribe to NAVIGATION_START on creation', () => {
    expect(mockSubscribe).toHaveBeenCalledWith(EventName.NAVIGATION_START, expect.any(Function));
  });

  describe('#register', () => {
    it('should cancel navigation after registering a callback that returns true', async () => {
      unsavedChangesService.register(() => true);
      const cancelNavigation = jest.fn();

      await triggerNavigation(makePayload(cancelNavigation));

      expect(cancelNavigation).toHaveBeenCalled();
    });

    it('should return a subscription that unregisters the callback', async () => {
      const unsubscribe = unsavedChangesService.register(() => true);
      unsubscribe();
      const cancelNavigation = jest.fn();

      await triggerNavigation(makePayload(cancelNavigation));

      expect(cancelNavigation).not.toHaveBeenCalled();
    });
  });

  describe('navigation interception', () => {
    it('should not cancel navigation when no callbacks are registered', async () => {
      const cancelNavigation = jest.fn();
      await triggerNavigation(makePayload(cancelNavigation));
      expect(cancelNavigation).not.toHaveBeenCalled();
    });

    it('should not cancel navigation when no registered callback returns true', async () => {
      unsavedChangesService.register(() => false);
      unsavedChangesService.register(() => false);
      const cancelNavigation = jest.fn();

      await triggerNavigation(makePayload(cancelNavigation));

      expect(cancelNavigation).not.toHaveBeenCalled();
    });

    it('should cancel navigation when at least one callback returns true', async () => {
      unsavedChangesService.register(() => false);
      unsavedChangesService.register(() => true);
      const cancelNavigation = jest.fn();

      await triggerNavigation(makePayload(cancelNavigation));

      expect(cancelNavigation).toHaveBeenCalledWith(expect.any(Promise));
    });

    it('should show the confirmation dialog with translated strings', async () => {
      unsavedChangesService.register(() => true);

      await triggerNavigation(makePayload());

      expect(confirmFn).toHaveBeenCalledWith(expect.objectContaining({
        header: 'Confirm',
        message: 'You have unsaved changes. Are you sure you want to continue?',
        acceptButtonProps: expect.objectContaining({label: 'Yes'}),
        rejectButtonProps: expect.objectContaining({label: 'Cancel'})
      }));
    });
  });

  describe('confirmation dialog resolution', () => {
    it('should resolve false (allow navigation) when the user confirms', async () => {
      unsavedChangesService.register(() => true);
      let capturedPromise: Promise<boolean> | undefined;
      const cancelNavigation = jest.fn((p) => { capturedPromise = p; });
      confirmFn.mockImplementation(({accept}: {accept: () => void}) => accept());

      await triggerNavigation(makePayload(cancelNavigation));

      await expect(capturedPromise).resolves.toBe(false);
    });

    it('should resolve true (cancel navigation) when the user rejects', async () => {
      unsavedChangesService.register(() => true);
      let capturedPromise: Promise<boolean> | undefined;
      const cancelNavigation = jest.fn((p) => { capturedPromise = p; });
      confirmFn.mockImplementation(({reject}: {reject: () => void}) => reject());

      await triggerNavigation(makePayload(cancelNavigation));

      await expect(capturedPromise).resolves.toBe(true);
    });
  });
});