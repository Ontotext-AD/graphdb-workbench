import {EventService} from '../event.service';
import {Event, Logout} from '../../../models/events';
import {EventName, NavigationEnd} from '../../../models/events';
import {LoggerProvider} from '../../logging/logger-provider';

const TEST_EVENT_NAME = 'testEventName';

describe('EventService', () => {
  let eventService: EventService;

  beforeEach(() => {
    eventService = new EventService();
  });

  it('emit should notify observers of a given event', async () => {

    const oldUrl = '/import';
    const newUrl = '/graphql';

    // Given: there are registered callback functions for the navigation end event.
    const callBackFunction = jest.fn();
    const callBackFunctionTwo = jest.fn();
    eventService.subscribe(EventName.NAVIGATION_END, callBackFunction);
    eventService.subscribe(EventName.NAVIGATION_END, callBackFunctionTwo);

    // When: the navigation end event is emitted.
    await eventService.emit(new NavigationEnd(oldUrl, newUrl));

    // Then: I expect the registered callback functions to be called.
    expect(callBackFunction).toHaveBeenLastCalledWith({oldUrl, newUrl});
    expect(callBackFunctionTwo).toHaveBeenLastCalledWith({oldUrl, newUrl});
  });

  it('emit should notify observers of a given event if emitted value is undefined', async () => {

    // Given: there is a registered callback function for an event.
    const callBackFunction = jest.fn();
    eventService.subscribe(TEST_EVENT_NAME, callBackFunction);

    // When: the event is emitted with undefined value.
    await eventService.emit(new TestEvent(undefined));

    // Then: I expect the registered callback function to be called.
    expect(callBackFunction).toHaveBeenLastCalledWith(undefined);
  });

  it('emit shouldn\'t notify observers if they are registered for another event', async () => {

    // Given: there is a registered callback function for the navigation end event.
    const callBackFunction = jest.fn();
    eventService.subscribe(EventName.NAVIGATION_END, callBackFunction);

    // When: an event different of the navigation end event is emitted.
    await eventService.emit(new TestEvent(undefined));

    // I expect the registered callback function not to be called
    expect(callBackFunction).toHaveBeenCalledTimes(0);
  });

  it('emit shouldn\'t notify observers that are unsubscribed', async () => {

    // Given there is a registered callback function for an event.
    const callBackFunction = jest.fn();
    const callBackFunctionTwo = jest.fn();
    eventService.subscribe(TEST_EVENT_NAME, callBackFunction);
    const unsubscribe = eventService.subscribe(TEST_EVENT_NAME, callBackFunctionTwo);

    // When the event is emitted,
    await eventService.emit(new TestEvent(undefined));
    // and unregister one of the functions (for example, the second one).
    unsubscribe();
    // and second event is emitted
    await eventService.emit(new TestEvent('test'));

    // Then I expect the first registered callback function to be called twice.
    expect(callBackFunction).toHaveBeenCalledTimes(2);
    // and the second one to be called only one
    expect(callBackFunctionTwo).toHaveBeenCalledTimes(1);
  });

  test('should not emit an event if a cancellation handler prevents the notification', async () => {
    // GIVEN: There are two subscribers to the logout event.
    const callBackFunction = jest.fn();
    const callBackFunctionTwo = jest.fn();
    eventService.subscribe(EventName.LOGOUT, callBackFunction);
    eventService.subscribe(EventName.LOGOUT, callBackFunctionTwo);
    // AND: There is a cancellation handler that cancels the emission of the logout event.
    const removeCancelingHandler = eventService.addCancellationHandler(EventName.LOGOUT, () => Promise.resolve(true));
    // AND: There is a cancellation handler that lets the emission proceed.
    eventService.addCancellationHandler(EventName.LOGOUT, () => Promise.resolve(false));

    // WHEN: I emit the logout event.
    await eventService.emit(new Logout());
    // THEN: I expect the callback functions not to be notified because a cancellation handler blocks the event emission.
    expect(callBackFunction).toHaveBeenCalledTimes(0);
    expect(callBackFunctionTwo).toHaveBeenCalledTimes(0);

    // WHEN: I remove the cancellation handler that cancels the event.
    removeCancelingHandler();
    // AND: I emit the logout event.
    await eventService.emit(new Logout());
    // THEN: I expect both subscribers to be notified because no cancellation handler blocks the event emission.
    expect(callBackFunction).toHaveBeenCalledTimes(1);
    expect(callBackFunctionTwo).toHaveBeenCalledTimes(1);
  });

  test('should notify the observers synchronously if there are no cancellation handlers', () => {
    // GIVEN: There is a registered event observer without a cancellation handler.
    const callBackFunction = jest.fn();
    eventService.subscribe(EventName.LOGOUT, callBackFunction);

    // WHEN: I emit the logout event without waiting for the result.
    void eventService.emit(new Logout());

    // THEN: I expect the observer to be notified before emit returns.
    expect(callBackFunction).toHaveBeenCalledTimes(1);
  });

  test('should notify the observers after the cancellation handlers if there are any', async () => {
    // GIVEN: There is a registered event observer.
    const callBackFunction = jest.fn();
    eventService.subscribe(EventName.LOGOUT, callBackFunction);
    // AND: There is a cancellation handler that does not cancel the event.
    eventService.addCancellationHandler(EventName.LOGOUT, () => Promise.resolve(false));

    // WHEN: I emit the logout event.
    const emitted = eventService.emit(new Logout());

    // THEN: I expect the observer not to be notified before the cancellation handler resolves.
    expect(callBackFunction).not.toHaveBeenCalled();
    // AND: I expect it to be notified after the cancellation handler resolves.
    await emitted;
    expect(callBackFunction).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['rejects', () => Promise.reject(new Error('Handler failed'))],
    ['throws', () => {
      throw new Error('Handler failed');
    }],
  ])('should emit the event and log the error if a cancellation handler %s', async (_, failingHandler) => {
    // GIVEN: There is a subscriber to the logout event and a cancellation handler that fails.
    const loggerErrorSpy = jest.spyOn(LoggerProvider.logger, 'error').mockImplementation(() => undefined);
    const callBackFunction = jest.fn();
    eventService.subscribe(EventName.LOGOUT, callBackFunction);
    eventService.addCancellationHandler(EventName.LOGOUT, failingHandler);

    // WHEN: I emit the logout event.
    const canceled = await eventService.emit(new Logout());

    // THEN: I expect the event not to be canceled.
    expect(canceled).toBe(false);
    // AND: I expect the observer to be notified.
    expect(callBackFunction).toHaveBeenCalledTimes(1);
    // AND: I expect the error to be logged.
    expect(loggerErrorSpy).toHaveBeenCalledWith(expect.stringContaining(EventName.LOGOUT), expect.any(Error));
    loggerErrorSpy.mockRestore();
  });
});

class TestEvent extends Event<string> {
  constructor(payload: string | undefined) {
    super(TEST_EVENT_NAME, payload);
  }
}
