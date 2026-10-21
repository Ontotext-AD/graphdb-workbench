# Persistence API

Local-storage-backed persistence for GraphDB Workbench, built on the `Persistence` interface and `LocalStorageService`.

## Contents

- [Overview of the `Persistence` API](#overview-of-the-persistence-api): the generic storage interface.
- [Key Components](#key-components): the `Persistence` interface and its methods.
- [Local Storage Implementation](#local-storage-implementation): `LocalStorageService`, namespaces, and key prefixing.
- [Handling Storage Change Events](#handling-storage-change-events): how storage events from other tabs update the context.
- [Practical Considerations](#practical-considerations): prefixed keys, specialization, error handling.

## Overview of the `Persistence` API

The `Persistence` API provides a generic interface for interacting with a storage system. It supports storing,
retrieving, and removing data via a `Storage`-compatible implementation (e.g., `localStorage` or `sessionStorage`).
The code is in [`packages/api/src/services/storage/`](../../packages/api/src/services/storage/).

## Key Components

**`Persistence` Interface**

The `Persistence` interface defines the structure for storage-related services:

- `getStorage(): Storage` - Returns the underlying storage implementation.
- `get(key: string): StorageData` - Retrieves the value associated with the provided key.
- `set(key: string, value: string): void` - Stores the given value under the provided key.
- `remove(key: string): void` - Deletes the value associated with the provided key.

## Local Storage Implementation

The `LocalStorageService` abstract class implements the `Persistence` interface using `localStorage`. It is the base
class for specialized storage services.

### Key Features

**1. Namespace Support:**

* Each service defines a unique `NAMESPACE` to scope its keys.
* Keys are stored as `<global>.<NAMESPACE>.<key>`, where the global prefix is `StorageKey.GLOBAL_NAMESPACE`
  (`ontotext.gdb`).

**2. Storage Methods:**

- `get(key: string, usePrefixedKey = true): StorageData` - Reads a value. Pass `false` to read a raw, unprefixed key.
- `getAsJson<T>(key: string): T | null` - Reads a raw key and parses it as JSON; `null` if missing or invalid.
- `storeValue(key: string, value: string): void` - Saves a value under the prefixed key.
- `remove(key: string, usePrefixedKey = true): void` - Removes a value.

Subclasses implement `set(key, value)`, usually by calling `storeValue`.

**3. Key Management:**

* The private `getPrefixedKey(key)` adds whatever part of the prefix is missing: a bare key gets both prefixes, a key
  that already starts with `<NAMESPACE>.` gets only the global one, and a fully prefixed key is left as is.

### Implementation Example

```typescript
export class LanguageStorageService extends LocalStorageService {
  readonly NAMESPACE = 'i18n';

  set(key: string, value: string) {
    this.storeValue(key, value);
  }
}
```
`LanguageStorageService` stores language-related properties under the `ontotext.gdb.i18n.` prefix.

## Handling Storage Change Events

`LocalStorageSubscriptionHandlerService` keeps the context in sync when `localStorage` changes in another tab.
`onto-layout` listens for the window's `storage` event and passes it to `handleStorageChange`.

### Workflow

1. On a `StorageEvent`, the service strips the global prefix and splits the rest into the namespace and the property
   name.
2. It finds the handler among all registered context services (`ServiceProvider.getAllBySuperType(ContextService)`):
   the first whose `canHandle(propertyName)` is true. The namespace is only required to be present.
3. The handler's `deserializeProperty()` turns the raw string into a value (see
   [Context API](context-api.md#restoring-values-from-storage)), and `updateContextProperty()` sets it. A removed key
   sets `undefined`.

### Key Method

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
    let newValue;
    if (event.newValue !== null) {
      newValue = handler.deserializeProperty(contextPropertyKey, event.newValue);
    }
    handler.updateContextProperty(contextPropertyKey, newValue);
  }
}
```

## Practical Considerations

1. **Prefixed keys.** Always go through a `LocalStorageService` subclass so keys are prefixed and isolated.
2. **Service specialization.** Extend `LocalStorageService` per domain, specifying the `NAMESPACE`.
3. **Property names.** For cross-tab sync, the stored key's property name must equal a context service field value
   (e.g. `selectedRepository`), so `canHandle` finds the service.
4. **Error handling.** A missing namespace or handler is logged at debug level and ignored.

---

See also: [Developers Guide](../developers-guide.md)
