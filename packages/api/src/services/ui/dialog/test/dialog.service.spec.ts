import {DialogService} from '../dialog.service';
import {CONFIRM_CANCEL_EVENT} from '../../../../models/dialog/dialog-constants';
import {CancelDialogAction} from '../../../../models/dialog/cancel-dialog-action';
import {ConfirmCancelPayload} from '../../../../models/dialog/dialog-payload';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    service = new DialogService();
  });

  test('should emit a confirm cancel event on document.body when confirmCancel is called', () => {
    // Given, I have a spy on document.body dispatchEvent
    const dispatchEventSpy = jest.spyOn(document.body, 'dispatchEvent');

    // When I call confirmCancel
    service.confirmCancel(false);

    // Then I expect a CustomEvent with the correct name to be dispatched
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({type: CONFIRM_CANCEL_EVENT})
    );
  });

  test('should emit a payload with hasDontShowAgain set to false', () => {
    // Given, I have a spy on document.body dispatchEvent
    const dispatchEventSpy = jest.spyOn(document.body, 'dispatchEvent');

    // When I call confirmCancel with hasDontShowAgain false
    service.confirmCancel(false);

    // Then I expect the payload to have hasDontShowAgain as false
    const emittedEvent = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
    const payload = emittedEvent.detail as ConfirmCancelPayload;
    expect(payload.hasDontShowAgain).toBe(false);
  });

  test('should emit a payload with hasDontShowAgain set to true', () => {
    // Given, I have a spy on document.body dispatchEvent
    const dispatchEventSpy = jest.spyOn(document.body, 'dispatchEvent');

    // When I call confirmCancel with hasDontShowAgain true
    service.confirmCancel(true);

    // Then I expect the payload to have hasDontShowAgain as true
    const emittedEvent = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
    const payload = emittedEvent.detail as ConfirmCancelPayload;
    expect(payload.hasDontShowAgain).toBe(true);
  });

  test('should resolve the promise with the action returned by the onClose callback', async () => {
    // Given, I have a spy on document.body dispatchEvent
    const dispatchEventSpy = jest.spyOn(document.body, 'dispatchEvent');

    // When I call confirmCancel and invoke the callback with an action
    const promise = service.confirmCancel(false);
    const emittedEvent = dispatchEventSpy.mock.calls[0][0] as CustomEvent;
    const payload = emittedEvent.detail as ConfirmCancelPayload;
    payload.onClose(CancelDialogAction.EXIT);

    // Then I expect the promise to resolve with the correct action
    await expect(promise).resolves.toBe(CancelDialogAction.EXIT);
  });
});
