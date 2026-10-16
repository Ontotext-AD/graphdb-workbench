import {TestBed} from '@angular/core/testing';
import {UnsavedChangesService} from './unsaved-changes.service';
import {ConfirmationService} from 'primeng/api';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {EventService, NavigationStart, service} from '@ontotext/workbench-api';

jest.mock('@ontotext/workbench-api', () => ({
  ...jest.requireActual('@ontotext/workbench-api'),
  service: jest.fn()
}));

const mockService = service as jest.MockedFunction<typeof service>;

describe('UnsavedChangesService', () => {
  let unsavedChangesService: UnsavedChangesService;
  let eventService: EventService;
  let confirmFn: jest.Mock;

  const navigate = (): Promise<boolean> => eventService.emit(new NavigationStart('http://localhost/old-route', 'http://localhost/new-route'));

  beforeEach(() => {
    // A fresh EventService per test, so the subscriptions of earlier service instances don't leak in.
    eventService = new EventService();
    mockService.mockReturnValue(eventService);
    confirmFn = jest.fn();

    TestBed.configureTestingModule({
      imports: [provideTranslocoForTesting()],
      providers: [
        UnsavedChangesService,
        {provide: ConfirmationService, useValue: {confirm: confirmFn}}
      ]
    });

    unsavedChangesService = TestBed.inject(UnsavedChangesService);
  });

  it('should allow navigation without a confirmation when no callback is registered', async () => {
    // GIVEN: No unsaved-changes callback is registered.

    // WHEN: The user navigates away.
    const canceled = await navigate();

    // THEN: The navigation proceeds and no confirmation is shown.
    expect(canceled).toBe(false);
    expect(confirmFn).not.toHaveBeenCalled();
  });

  it('should allow navigation without a confirmation when no callback reports unsaved changes', async () => {
    // GIVEN: Two registered callbacks report no unsaved changes.
    unsavedChangesService.register(() => false);
    unsavedChangesService.register(() => false);

    // WHEN: The user navigates away.
    const canceled = await navigate();

    // THEN: The navigation proceeds and no confirmation is shown.
    expect(canceled).toBe(false);
    expect(confirmFn).not.toHaveBeenCalled();
  });

  it('should show the confirmation dialog with translated strings when a callback reports unsaved changes', async () => {
    // GIVEN: One of the registered callbacks reports unsaved changes.
    unsavedChangesService.register(() => false);
    unsavedChangesService.register(() => true);
    // AND: The user confirms leaving the page.
    confirmFn.mockImplementation(({accept}: {accept: () => void}) => accept());

    // WHEN: The user navigates away.
    await navigate();

    // THEN: The translated confirmation dialog is shown.
    expect(confirmFn).toHaveBeenCalledWith(expect.objectContaining({
      header: 'Confirm',
      message: 'You have unsaved changes. Are you sure you want to continue?',
      acceptButtonProps: expect.objectContaining({label: 'Yes'}),
      rejectButtonProps: expect.objectContaining({label: 'Cancel'})
    }));
  });

  it('should allow navigation when the user confirms leaving the page', async () => {
    // GIVEN: A registered callback reports unsaved changes.
    unsavedChangesService.register(() => true);
    // AND: The user confirms leaving the page.
    confirmFn.mockImplementation(({accept}: {accept: () => void}) => accept());

    // WHEN: The user navigates away.
    const canceled = await navigate();

    // THEN: The navigation proceeds.
    expect(canceled).toBe(false);
  });

  it('should cancel navigation when the user rejects leaving the page', async () => {
    // GIVEN: A registered callback reports unsaved changes.
    unsavedChangesService.register(() => true);
    // AND: The user rejects leaving the page.
    confirmFn.mockImplementation(({reject}: {reject: () => void}) => reject());

    // WHEN: The user navigates away.
    const canceled = await navigate();

    // THEN: The navigation is canceled.
    expect(canceled).toBe(true);
  });

  it('should stop consulting a callback after its subscription is removed', async () => {
    // GIVEN: A callback that reports unsaved changes is registered and then unsubscribed.
    const unsubscribe = unsavedChangesService.register(() => true);
    unsubscribe();

    // WHEN: The user navigates away.
    const canceled = await navigate();

    // THEN: The navigation proceeds and no confirmation is shown.
    expect(canceled).toBe(false);
    expect(confirmFn).not.toHaveBeenCalled();
  });
});
