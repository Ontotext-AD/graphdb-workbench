# Persistence API

Local-storage-backed persistence for GraphDB Workbench, built on the `Persistence` interface and `LocalStorageService`.

## Persistence API and Local Storage Implementation in GraphDB Workbench

This guide explains the `Persistence` API and its local storage implementation in the GraphDB Workbench application. It 
includes details about the key interfaces, abstract classes, and practical examples for implementing persistent storage
using local storage.

---

### Overview of the `Persistence` API

The `Persistence` API provides a generic interface for interacting with a storage system. It supports storing, 
retrieving, and removing data via a `Storage` interface-compatible implementation (e.g., localStorage or sessionStorage).

### Key Components

**`Persistence` Interface**

The `Persistence` interface defines the structure for storage-related services.

**Methods:**

`getStorage(): Storage` - Returns the underlying storage implementation.

`get(key: string): StorageData` - Retrieves the value associated with the provided key.

`set(key: string, value: string): void` - Stores the given value under the provided key.

`remove(key: string): void` - Deletes the value associated with the provided key.

---

### Local Storage Implementation

The `LocalStorageService` abstract class implements the `Persistence` interface using the localStorage API. This 
implementation serves as a base class for specialized storage services.

#### Key Features

**1. Namespace Support:**

* Each service defines a unique `NAMESPACE` to scope its keys.
* Keys are prefixed with a global namespace (`StorageKey.GLOBAL_NAMESPACE`) and the service-specific namespace.

**2. Storage Methods:**

`get(key: string): StorageData` - Fetches a value from `localStorage`.

`storeValue(key: string, value: string): void` - Saves a value to `localStorage`.

`remove(key: string): void` - Removes a value from `localStorage`.

**3. Key Management:**

* The `getPrefixedKey(key: string): string` method ensures that all keys are prefixed correctly for consistency and 
collision avoidance.

#### Implementation Example

```typescript
export class LanguageStorageService extends LocalStorageService {
  readonly NAMESPACE = 'i18n';

  set(key: string, value: string) {
    this.storeValue(key, value);
  }
}
```
In this example, `LanguageStorageService` manages language-related properties in the `localStorage`, scoped under the 
i18n namespace.

---

### Handling Storage Change Events

The `LocalStorageSubscriptionHandlerService` listens to storage change events and updates the application context 
accordingly. It works in conjunction with `ContextService` implementations to resolve and update the context properties.

#### Workflow

1. On a `StorageEvent`, the service parses the key to extract the namespace and property name.
2. It resolves the appropriate handler using the `resolveHandler(namespace, propertyName)` method.
3. If a handler exists, it invokes the handler to update the corresponding context property.

#### Key Method

```typescript
handleStorageChange(event: StorageEvent): void {
  const withoutGlobalPrefix = event.key?.substring(StorageKey.GLOBAL_NAMESPACE.length + 1);
  let namespace = '';
  let contextPropertyKey = '';

  if (withoutGlobalPrefix) {
    namespace = withoutGlobalPrefix.substring(0, withoutGlobalPrefix.indexOf('.'));
    contextPropertyKey = withoutGlobalPrefix.substring(namespace.length + 1);
  }

  const handler = this.resolveHandler(namespace, contextPropertyKey);
  if (handler) {
    handler.updateContextProperty(contextPropertyKey, event.newValue);
  }
}
```

---

### Practical Considerations

1. Prefixed Keys:
Always use prefixed keys to ensure isolation and avoid conflicts.
2. Service Specialization:
Extend `LocalStorageService` to define domain-specific storage services, specifying the `NAMESPACE` and implementing 
additional functionality if needed.
3. Error Handling:
Handle cases where a key or handler is missing with appropriate logging or fallback mechanisms.

---

### Summary

The `Persistence` API and its local storage implementation provide a robust framework for managing persistent data in
the GraphDB Workbench application. By adhering to the namespace conventions and leveraging the `LocalStorageService` as
a base class, developers can efficiently implement and maintain storage-related functionality.

---

See also: [Developers Guide](../developers-guide.md)
