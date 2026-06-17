import {EventService} from '../event.service';
import {Event, Logout} from '../../../models/events';
import {EventName, NavigationEnd} from '../../../models/events';

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
    await emitAndWait(eventService, new NavigationEnd(oldUrl, newUrl));

    // Then: I expect the registered callback functions to be called.
    expect(callBackFunction).toHaveBeenLastCalledWith({oldUrl, newUrl});
    expect(callBackFunctionTwo).toHaveBeenLastCalledWith({oldUrl, newUrl});
  });

  it('emit should notify observers of a given event if emitted value is undefined', async () => {

    // Given: there is a registered callback function for an event.
    const callBackFunction = jest.fn();
    eventService.subscribe(TEST_EVENT_NAME, callBackFunction);

    // When: the event is emitted with undefined value.
    await emitAndWait(eventService, new TestEvent(undefined));

    // Then: I expect the registered callback function to be called.
    expect(callBackFunction).toHaveBeenLastCalledWith(undefined);
  });

  it('emit shouldn\'t notify observers if they are registered for another event', async () => {

    // Given: there is a registered callback function for the navigation end event.
    const callBackFunction = jest.fn();
    eventService.subscribe(EventName.NAVIGATION_END, callBackFunction);

    // When: an event different of the navigation end event is emitted.
    await emitAndWait(eventService, new TestEvent(undefined));

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
    await emitAndWait(eventService, new TestEvent(undefined));
    // and unregister one of the functions (for example, the second one).
    unsubscribe();
    // and second event is emitted
    await emitAndWait(eventService, new TestEvent('test'));

    // Then I expect the first registered callback function to be called twice.
    expect(callBackFunction).toHaveBeenCalledTimes(2);
    // and the second one to be called only one
    expect(callBackFunctionTwo).toHaveBeenCalledTimes(1);
  });

  test('should not emit an event if a cancellation handler prevents the notification', async () => {
    // GIVEN: There is a registered event observer that cancels emission of the logout event.
    const callBackFunction = jest.fn();
    const shouldCancelHandler = () => Promise.resolve(true);
    const unsubscribeCanceledObserver = eventService.subscribe(EventName.LOGOUT, callBackFunction, shouldCancelHandler);
    // AND: There is a registered event observer that does not cancel emission of the logout event.
    const callBackFunctionTwo = jest.fn();
    const shouldCancelHandlerTwo = () => Promise.resolve(false);
    eventService.subscribe(EventName.LOGOUT, callBackFunctionTwo, shouldCancelHandlerTwo);

    // WHEN: I emit the logout event.
    await emitAndWait(eventService, new Logout());
    // THEN: I expect the callback functions not to be notified because a cancellation handler blocks the event emission.
    expect(callBackFunction).toHaveBeenCalledTimes(0);
    expect(callBackFunctionTwo).toHaveBeenCalledTimes(0);

    // WHEN: I unsubscribe the observer that cancels the event.
    unsubscribeCanceledObserver();
    // AND: I emit the logout event.
    await emitAndWait(eventService, new Logout());
    // THEN: I expect the callback function to be called because there is no cancellation handler that blocks the event emission.
    expect(callBackFunctionTwo).toHaveBeenCalledTimes(1);
  });
});

class TestEvent extends Event<string> {
  constructor(payload: string | undefined) {
    super(TEST_EVENT_NAME, payload);
  }
}

/**
 * Emits the provided event and waits for all asynchronous event processing to complete before returning.
 *
 * @template T - The type of the event payload.
 * @param eventService - The event service used to emit the event.
 * @param event - The event to emit.
 */
export async function emitAndWait<T extends {} | undefined>(eventService: EventService, event: Event<T>): Promise<void> {
  eventService.emit(event);
  // emit() returns void, but it performs an asynchronous cancellation check before notifying subscribers.
  // Wait for the pending promise chain to complete before verifying that the callbacks were called.
  await new Promise(process.nextTick);
}
