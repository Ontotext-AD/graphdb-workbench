import {NamespacesContextService} from '../namespaces-context.service';
import {NamespaceMap} from '../../../models/namespace';

describe('Namespaces Context Service', () => {
  let service: NamespacesContextService;

  beforeEach(() => {
    service = new NamespacesContextService();
  });

  test('should update namespaces and notify subscribers', () => {
    // Given a new namespace object
    const namespaceMap = new NamespaceMap({owl: 'http://www.w3.org/2002/07/owl#', rdfs: 'http://www.w3.org/20'});
    const mockCallback = jest.fn();
    service.onNamespacesChanged(mockCallback);

    // When updating the namespaces
    service.updateNamespaces(namespaceMap);

    // Then the context should be updated and subscribers notified
    expect(mockCallback).toHaveBeenCalledWith(namespaceMap);
  });

  test('should stop receiving updates, after unsubscribe', () => {
    // Given a new namespace object
    const namespaceMap = new NamespaceMap({owl: 'http://www.w3.org/2002/07/owl#', rdfs: 'http://www.w3.org/20'});
    const mockCallback = jest.fn();
    const unsubscribe = service.onNamespacesChanged(mockCallback);
    // Clear the callback call when the callback function is registered.
    mockCallback.mockClear();

    // When unsubscribed
    unsubscribe();

    // Then the context should not receive updates
    service.updateNamespaces(namespaceMap);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
