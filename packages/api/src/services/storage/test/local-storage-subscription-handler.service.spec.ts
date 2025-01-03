import {ContextService} from '../../context';
import {LocalStorageSubscriptionHandlerService} from '../local-storage-subscription-handler.service';
import {ServiceProvider} from '../../../providers';
import {StorageKey} from '../../../models/storage';
import {DeriveContextServiceContract} from '../../../models/context/update-context-method';

describe('LocalStorageSubscriptionHandlerService', () => {
  let service: LocalStorageSubscriptionHandlerService;
  let mockContextService: ContextService<Record<string, unknown>>;

  beforeEach(() => {
    service = new LocalStorageSubscriptionHandlerService();
    // Register the mock context service in the service provider
    mockContextService = ServiceProvider.get(TestContextService);
    jest.spyOn(mockContextService, 'updateContextProperty');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handleStorageChange should handle storage change event and trigger context property change handler', () => {
    const event = {
      key: `${StorageKey.GLOBAL_NAMESPACE}.namespace.testProperty`,
      newValue: 'newValue'
    } as StorageEvent;

    service.handleStorageChange(event);

    expect(mockContextService.updateContextProperty).toHaveBeenCalledWith('testProperty', 'newValue');
  });

  test('should warn if namespace is missing in storage change event key', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const event = {
      key: `${StorageKey.GLOBAL_NAMESPACE}.propertyName`,
      newValue: 'newValue'
    } as StorageEvent;

    service.handleStorageChange(event);

    expect(consoleWarnSpy).toHaveBeenCalledWith('Namespace is required to resolve a context property change handler.');
  });

  test('should warn if no context property change handler is found', () => {
    jest.spyOn(ServiceProvider, 'getAllBySuperType').mockReturnValue([]);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const event = {
      key: `${StorageKey.GLOBAL_NAMESPACE}.namespace.propertyName`,
      newValue: 'newValue'
    } as StorageEvent;

    service.handleStorageChange(event);

    expect(consoleWarnSpy).toHaveBeenCalledWith('No context property change handler found for namespace: namespace and property: propertyName');
  });

  test('should not trigger handler if event key is null', () => {
    const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation(() => {
      // Do nothing
    });
    const event = {
      key: null,
      newValue: 'newValue'
    } as StorageEvent;

    service.handleStorageChange(event);

    expect(mockContextService.updateContextProperty).not.toHaveBeenCalled();

    consoleWarnMock.mockRestore();
  });
});

type TestContextFields = {
  readonly TEST_PROPERTY: string;
}

class TestContextService extends ContextService<TestContextFields> implements DeriveContextServiceContract<TestContextFields> {
  readonly TEST_PROPERTY = 'testProperty';

  updateTestProperty(value: string): void {
    this.updateContextProperty(this.TEST_PROPERTY, value);
  }
}
