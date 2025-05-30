import {ServiceProvider} from '../../../providers';
import {ContextSubscriptionManager} from '../context-subscription-manager';
import {ValueChangeCallback} from '../../../models/context/value-change-callback';
import {BeforeChangeValidationPromise} from '../../../models/context/before-change-validation-promise';
import {ContextService} from '../context.service';

interface MockContextService {
  canSubscribeAll: boolean;
  subscribeAll: jest.Mock<() => void>;
}

describe('ContextSubscriptionManager test cases', () => {
  let originalGetAllBySuperType: typeof ServiceProvider.getAllBySuperType;

  beforeAll(() => {
    originalGetAllBySuperType = ServiceProvider.getAllBySuperType;
  });

  afterAll(() => {
    ServiceProvider.getAllBySuperType = originalGetAllBySuperType;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createMockService(): MockContextService {
    const subscribeAllMock = jest.fn(() => {
      return jest.fn();
    });
    return {
      canSubscribeAll: true,
      subscribeAll: subscribeAllMock,
    };
  }

  test('registerContextService should store the service instance', () => {
    ServiceProvider.getAllBySuperType = jest.fn().mockReturnValue([]);
    const globalSub = new ContextSubscriptionManager();

    const serviceA = createMockService();
    const typedServiceA = (serviceA as unknown) as ContextService<Record<string, unknown>>;

    const unsubA = globalSub.subscribeToService(typedServiceA);
    expect(serviceA.subscribeAll).not.toHaveBeenCalled();

    const cbGlobal: ValueChangeCallback<unknown> = jest.fn();
    const beforeGlobal: BeforeChangeValidationPromise<unknown> = jest.fn();
    const afterGlobal: ValueChangeCallback<unknown> = jest.fn();

    const unsubGlobal = globalSub.subscribeToAllRegisteredContexts(
      cbGlobal,
      beforeGlobal,
      afterGlobal
    );

    globalSub.subscribeToService(typedServiceA);

    expect(serviceA.subscribeAll).toHaveBeenCalledTimes(1);
    expect(serviceA.subscribeAll).toHaveBeenCalledWith(
      cbGlobal,
      beforeGlobal,
      afterGlobal
    );

    // Cleanup
    unsubA();
    unsubGlobal();
  });

  test('subscribeToAllRegisteredContexts should call subscribeAll on newly registered service', () => {
    ServiceProvider.getAllBySuperType = jest.fn().mockReturnValue([]);

    const globalSub = new ContextSubscriptionManager();
    const cbGlobal: ValueChangeCallback<unknown> = jest.fn();
    const beforeGlobal: BeforeChangeValidationPromise<unknown> = jest.fn();
    const afterGlobal: ValueChangeCallback<unknown> = jest.fn();

    const unsubGlobal = globalSub.subscribeToAllRegisteredContexts(
      cbGlobal,
      beforeGlobal,
      afterGlobal
    );

    const serviceB = createMockService();
    const typedServiceB = (serviceB as unknown) as ContextService<Record<string, unknown>>;

    const unsubB = globalSub.subscribeToService(typedServiceB);

    expect(serviceB.subscribeAll).toHaveBeenCalledTimes(1);
    expect(serviceB.subscribeAll).toHaveBeenCalledWith(
      cbGlobal,
      beforeGlobal,
      afterGlobal
    );

    // Cleanup
    unsubB();
    unsubGlobal();
  });

  test('unsubscribe function should remove subscriber and call unsub functions', () => {
    const service1 = createMockService();
    const service2 = createMockService();
    ServiceProvider.getAllBySuperType = jest
      .fn()
      .mockReturnValue([service1, service2]);

    const globalSub = new ContextSubscriptionManager();
    const cbGlobal: ValueChangeCallback<unknown> = jest.fn();
    const beforeGlobal: BeforeChangeValidationPromise<unknown> = jest.fn();
    const afterGlobal: ValueChangeCallback<unknown> = jest.fn();

    const unsubGlobal = globalSub.subscribeToAllRegisteredContexts(
      cbGlobal,
      beforeGlobal,
      afterGlobal
    );

    expect(service1.subscribeAll).toHaveBeenCalledTimes(1);
    expect(service2.subscribeAll).toHaveBeenCalledTimes(1);

    const unsubFn1 = service1.subscribeAll.mock.results[0]
      .value as jest.Mock;
    const unsubFn2 = service2.subscribeAll.mock.results[0]
      .value as jest.Mock;

    unsubGlobal();

    expect(unsubFn1).toHaveBeenCalledTimes(1);
    expect(unsubFn2).toHaveBeenCalledTimes(1);

    unsubGlobal();
    expect(unsubFn1).toHaveBeenCalledTimes(1);
    expect(unsubFn2).toHaveBeenCalledTimes(1);

    const service3 = createMockService();
    const typedService3 = (service3 as unknown) as ContextService<Record<string, unknown>>;
    const unsub3 = globalSub.subscribeToService(typedService3);

    expect(service3.subscribeAll).not.toHaveBeenCalled();

    // Cleanup
    unsub3();
  });

  test('subscribeToAllRegisteredContexts passes afterChangeCallback to services', () => {
    const serviceX = createMockService();
    ServiceProvider.getAllBySuperType = jest.fn().mockReturnValue([serviceX]);

    const globalSub = new ContextSubscriptionManager();
    const cbGlobal: ValueChangeCallback<unknown> = jest.fn();
    const beforeGlobal: BeforeChangeValidationPromise<unknown> = jest.fn();
    const afterGlobal: ValueChangeCallback<unknown> = jest.fn();

    const unsubGlobal = globalSub.subscribeToAllRegisteredContexts(
      cbGlobal,
      beforeGlobal,
      afterGlobal
    );

    expect(serviceX.subscribeAll).toHaveBeenCalledTimes(1);
    expect(serviceX.subscribeAll).toHaveBeenCalledWith(
      cbGlobal,
      beforeGlobal,
      afterGlobal
    );

    const serviceY = createMockService();
    ServiceProvider.getAllBySuperType = jest.fn().mockReturnValue([serviceY]);
    const globalSub2 = new ContextSubscriptionManager();
    const cb2: ValueChangeCallback<unknown> = jest.fn();
    const before2: BeforeChangeValidationPromise<unknown> = jest.fn();

    const unsubGlobal2 = globalSub2.subscribeToAllRegisteredContexts(
      cb2,
      before2
    );

    expect(serviceY.subscribeAll).toHaveBeenCalledTimes(1);
    expect(serviceY.subscribeAll.mock.calls[0]).toEqual([cb2, before2, undefined]);

    // Cleanup
    unsubGlobal();
    unsubGlobal2();
  });

  test('unsubscribing from global subscription does not affect individual property subscriptions', () => {
    const serviceZ = createMockService();
    ServiceProvider.getAllBySuperType = jest.fn().mockReturnValue([serviceZ]);

    const globalSub = new ContextSubscriptionManager();

    const cbIndividual: ValueChangeCallback<unknown> = jest.fn();
    const unsubIndividual = serviceZ.subscribeAll(cbIndividual); // returns its own jest.fn()

    expect(serviceZ.subscribeAll).toHaveBeenCalledTimes(1);

    const cbGlobal: ValueChangeCallback<unknown> = jest.fn();
    const beforeGlobal: BeforeChangeValidationPromise<unknown> = jest.fn();
    const afterGlobal: ValueChangeCallback<unknown> = jest.fn();

    const unsubGlobal = globalSub.subscribeToAllRegisteredContexts(
      cbGlobal,
      beforeGlobal,
      afterGlobal
    );
    expect(serviceZ.subscribeAll).toHaveBeenCalledTimes(2);

    const unsubFromGlobal = serviceZ.subscribeAll.mock.results[1]
      .value as jest.Mock;

    unsubGlobal();
    expect(unsubFromGlobal).toHaveBeenCalledTimes(1);
    expect(unsubIndividual).not.toHaveBeenCalled();

    // Cleanup: manually unsubscribe the individual subscription
    unsubIndividual();
  });

  test('subscribeToService after global unsub does nothing', () => {
    const globalSub = new ContextSubscriptionManager();
    const cb = jest.fn();
    const unsub = globalSub.subscribeToAllRegisteredContexts(cb);

    unsub();

    const service = createMockService();
    globalSub.subscribeToService(service as unknown as ContextService<Record<string, unknown>>);

    expect(service.subscribeAll).not.toHaveBeenCalled();
  });
});

