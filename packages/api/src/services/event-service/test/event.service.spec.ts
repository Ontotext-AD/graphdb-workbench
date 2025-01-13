import {EventService} from '../event.service';
import {Event} from '../../../models/events';
import {EventName, NavigationEnd} from '../../../models/events';

const TEST_EVENT_NAME = 'testEventName';

describe('EventService', () => {
  let eventService: EventService;

  beforeEach(() => {
    eventService = new EventService();
  });

  it('emit should notify observers of a given event', () => {

    const oldUrl = '/import';
    const newUrl = '/graphql';

    // Given: there are registered callback functions for the navigation end event.
    const callBackFunction = jest.fn();
    const callBackFunctionTwo = jest.fn();
    eventService.subscribe(EventName.NAVIGATION_END, callBackFunction);
    eventService.subscribe(EventName.NAVIGATION_END, callBackFunctionTwo);

    // When: the navigation end event is emitted.
    eventService.emit(new NavigationEnd(oldUrl, newUrl));

    // Then: I expect the registered callback functions to be called.
    expect(callBackFunction).toHaveBeenLastCalledWith({oldUrl, newUrl});
    expect(callBackFunctionTwo).toHaveBeenLastCalledWith({oldUrl, newUrl});
  });

  it('emit should notify observers of a given event if emitted value is undefined', () => {

    // Given: there is a registered callback function for an event.
    const callBackFunction = jest.fn();
    eventService.subscribe(TEST_EVENT_NAME, callBackFunction);

    // When: the event is emitted with undefined value.
    eventService.emit(new TestEvent(undefined));

    // Then: I expect the registered callback function to be called.
    expect(callBackFunction).toHaveBeenLastCalledWith(undefined);
  });

  it('emit shouldn\'t notify observers if they are registered for another event', () => {

    // Given: there is a registered callback function for the navigation end event.
    const callBackFunction = jest.fn();
    eventService.subscribe(EventName.NAVIGATION_END, callBackFunction);

    // When: an event different of the navigation end event is emitted.
    eventService.emit(new TestEvent(undefined));

    // I expect the registered callback function not to be called
    expect(callBackFunction).toHaveBeenCalledTimes(0);
  });

  it('emit shouldn\'t notify observers that are unsubscribed', () => {

    // Given there is a registered callback function for an event.
    const callBackFunction = jest.fn();
    const callBackFunctionTwo = jest.fn();
    eventService.subscribe(TEST_EVENT_NAME, callBackFunction);
    const unsubscribe = eventService.subscribe(TEST_EVENT_NAME, callBackFunctionTwo);

    // When the event is emitted,
    eventService.emit(new TestEvent(undefined));
    // and unregister one of the functions (for example, the second one).
    unsubscribe();
    // and second event is emitted
    eventService.emit(new TestEvent('test'));

    // Then I expect the first registered callback function to be called twice.
    expect(callBackFunction).toHaveBeenCalledTimes(2);
    // and the second one to be called only one
    expect(callBackFunctionTwo).toHaveBeenCalledTimes(1);
  });
});

class TestEvent extends Event<string> {
  constructor(payload: string | undefined) {
    super(TEST_EVENT_NAME, payload);
  }
}
