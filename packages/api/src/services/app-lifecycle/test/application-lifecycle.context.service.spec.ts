import {ApplicationLifecycleContextService} from '../application-lifecycle-context.service';
import {LifecycleState} from '../../../models/app-lifecycle';

describe('Application lifecycle service', () => {
  let service: ApplicationLifecycleContextService;

  beforeEach(() => {
    service = new ApplicationLifecycleContextService();
  });

  test('should emit the APPLICATION_DATA_LOADED event when emitApplicationDataLoaded is called', () => {
    const mockCallback = jest.fn();
    const unsubscribe = service.onApplicationDataStateChanged(mockCallback);

    service.updateApplicationDataState(LifecycleState.DATA_LOADED);
    expect(mockCallback).toHaveBeenCalledWith(LifecycleState.DATA_LOADED);
    expect(mockCallback).toHaveBeenCalledTimes(2);

    unsubscribe();

    service.updateApplicationDataState(LifecycleState.DATA_LOADED);
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });

  test('should subscribe to the APPLICATION_DATA_LOADED event and call the provided callback when the event is emitted', () => {
    const mockCallback = jest.fn();
    service.onApplicationDataStateChanged(mockCallback);

    service.updateApplicationDataState(LifecycleState.DATA_LOADED);
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });

  test('should get the current application data state', () => {
    expect(service.getApplicationDataState()).toBeUndefined();
    service.updateApplicationDataState(LifecycleState.DATA_LOADED);
    expect(service.getApplicationDataState()).toBe(LifecycleState.DATA_LOADED);
  });
});
