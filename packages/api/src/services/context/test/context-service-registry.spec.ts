import {ContextServiceRegistry} from '../context-service-registry';
import {ContextService} from '../context.service';

describe('ContextServiceRegistry', () => {
  let registry: ContextServiceRegistry;

  beforeEach(() => {
    registry = new ContextServiceRegistry();
  });

  const createMockContextService = (): jest.Mocked<ContextService<never>> => ({
    subscribeAll: jest.fn().mockReturnValue(jest.fn()),
  } as unknown as jest.Mocked<ContextService<never>>);

  test('registerContextService should store the service instance', () => {
    const mockService = createMockContextService();

    registry.registerContextService(mockService);

    // Internal state not directly accessible, so we rely on side effects (subscriptions)
    const callback = jest.fn();
    registry.subscribeToAllRegisteredContexts(callback);

    // Registering new service should trigger subscription
    const anotherService = createMockContextService();
    registry.registerContextService(anotherService);

    expect(anotherService.subscribeAll).toHaveBeenCalledWith(callback, undefined, undefined);
  });

  test('subscribeToAllRegisteredContexts should call subscribeAll on existing services', () => {
    const mockService1 = createMockContextService();
    const mockService2 = createMockContextService();

    registry.registerContextService(mockService1);
    registry.registerContextService(mockService2);

    const callback = jest.fn();
    registry.subscribeToAllRegisteredContexts(callback);

    expect(mockService1.subscribeAll).toHaveBeenCalledWith(callback, undefined, undefined);
    expect(mockService2.subscribeAll).toHaveBeenCalledWith(callback, undefined, undefined);
  });

  test('unsubscribe function should remove subscriber and call unsub functions', () => {
    const mockService = createMockContextService();
    const mockUnsub = jest.fn();
    mockService.subscribeAll.mockReturnValue(mockUnsub);

    registry.registerContextService(mockService);

    const callback = jest.fn();
    const unsubscribe = registry.subscribeToAllRegisteredContexts(callback);

    unsubscribe();

    // unsub callback is called
    expect(mockUnsub).toHaveBeenCalled();

    // subscribing again should not duplicate the old callback
    registry.registerContextService(createMockContextService());
  });

  test('subscribeToAllRegisteredContexts passes afterChangeCallback to services', () => {
    const mockService = createMockContextService();
    registry.registerContextService(mockService);

    const callback = jest.fn();
    const afterChangeCallback = jest.fn();

    registry.subscribeToAllRegisteredContexts(callback, undefined, afterChangeCallback);

    expect(mockService.subscribeAll).toHaveBeenCalledWith(callback, undefined, afterChangeCallback);
  });

  test('afterChangeCallback is invoked after callback', () => {
    const mockService = createMockContextService();

    const mockValue = 'new value';
    const callback = jest.fn();
    const afterChangeCallback = jest.fn();

    const invokedOrder: string[] = [];

    mockService.subscribeAll.mockImplementation((cb, _before, afterCb) => {
      cb(mockValue);
      afterCb?.(mockValue);
      return jest.fn();
    });

    registry.registerContextService(mockService);
    registry.subscribeToAllRegisteredContexts(
      (val) => {
        invokedOrder.push('callback');
        callback(val);
      },
      undefined,
      (val) => {
        invokedOrder.push('afterCallback');
        afterChangeCallback(val);
      }
    );

    expect(callback).toHaveBeenCalledWith(mockValue);
    expect(afterChangeCallback).toHaveBeenCalledWith(mockValue);
    expect(invokedOrder).toEqual(['callback', 'afterCallback']);
  });

  test('unsubscribing from global subscription does not affect individual property subscriptions', () => {
    const mockService = createMockContextService();
    const individualCallback = jest.fn();

    const individualUnsub = jest.fn();
    const globalUnsub = jest.fn();

    mockService.subscribeAll.mockReturnValue(globalUnsub);
    mockService.subscribeAll.mockImplementationOnce(() => globalUnsub);

    registry.registerContextService(mockService);

    const globalCallback = jest.fn();
    const unsubscribeGlobal = registry.subscribeToAllRegisteredContexts(globalCallback);

    // Simulate independent property subscription
    const individualService = createMockContextService();
    individualService.subscribeAll = jest.fn().mockReturnValue(individualUnsub);
    registry.registerContextService(individualService);
    const unsubscribeIndividual = individualService.subscribeAll(individualCallback);

    // Now unsubscribe global
    unsubscribeGlobal();

    expect(globalUnsub).toHaveBeenCalled();
    expect(individualUnsub).not.toHaveBeenCalled();

    unsubscribeIndividual();
    expect(individualUnsub).toHaveBeenCalled();
  });
});
