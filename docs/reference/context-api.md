# Context API

Stateful context services and the `ContextService` abstraction for managing shared application state in GraphDB Workbench.

## Contents

- [Overview](#overview): what the `ContextService` API is for.
- [Core Concepts](#core-concepts): the abstract `ContextService` and its utility types.
- [Implementation Example: `RepositoryContextService`](#implementation-example-repositorycontextservice): its fields and methods.
- [Step-by-Step Guide to Using `ContextService`](#step-by-step-guide-to-using-contextservice): define fields, extend, get the service, subscribe.
- [Subscription behaviour](#subscription-behaviour): immediate callback, validation before a change, `subscribeAll`.
- [Restoring values from storage](#restoring-values-from-storage): `getDeserializedContext()`.

## Overview

A context service is the single owner of one piece of shared state (selected repository, language, security, …) in
`packages/api`. Consumers in every package read the current value from it and subscribe to changes. See
[state ownership](../conventions/architecture.md#state-ownership).

The `ContextService` API ([`context.service.ts`](../../packages/api/src/services/context/context.service.ts)):

* updates context values;
* notifies subscribers about changes, optionally after validating them;
* enforces type safety with generic constraints.

## Core Concepts

### Abstract `ContextService`

The `ContextService` class is generic and requires a type parameter `TFields` that defines the fields the service can
handle. Each field corresponds to a property of the service and is managed via the context map.

Key methods:

- `updateContextProperty(name, value)`: sets the value of a property and notifies subscribers.
- `validatePropertyChange(name, value)`: runs the subscribers' before-change validations; resolves to `false` if any rejects.
- `getContextPropertyValue(name)` (protected): returns the current value.
- `subscribe(name, callback, beforeChangeValidation?, afterChangeCallback?, skipFirst?)` (protected): registers a callback; returns an unsubscribe function.
- `subscribeAll(...)`: subscribes to every field of the service.

### Utility Types

`SnakeToPascalCase` converts `SNAKE_CASE` field names to `PascalCase` for method naming.

`DeriveContextServiceContract` requires an update method for each field. For example, a field `SELECTED_REPOSITORY`
requires an `updateSelectedRepository` method.

## Implementation Example: `RepositoryContextService`

[`RepositoryContextService`](../../packages/api/src/services/domain/repository/repository-context.service.ts) owns the
repository list and the selected repository.

### Fields
```typescript
readonly SELECTED_REPOSITORY = 'selectedRepository';
readonly REPOSITORY_LIST = 'repositoryList';
```

### Methods

**Updating**

- `updateSelectedRepository(repositoryReference?: RepositoryReference): Promise<void>` — resolves the reference against
  the repository list, runs the before-change validations, then persists the selection and updates the context.
- `updateRepositoryList(repositories: RepositoryList): void`

**Reading**

- `getSelectedRepository(): Repository | undefined`
- `getRepositoryList(): RepositoryList` — an empty list if none is loaded yet.

**Subscribing**

- `onSelectedRepositoryChanged(callback, beforeChangeValidationPromise?): () => void`
- `onRepositoryListChanged(callback): () => void`

## Step-by-Step Guide to Using `ContextService`

**1. Define Context Fields and Parameters**

```typescript
type RepositoryContextFields = {
  readonly REPOSITORY_LIST: string;
  readonly SELECTED_REPOSITORY: string;
};

type RepositoryContextFieldParams = {
  readonly REPOSITORY_LIST: RepositoryList;
  readonly SELECTED_REPOSITORY: RepositoryReference;
};
```

**2. Extend ContextService**

```typescript
export class RepositoryContextService extends ContextService<RepositoryContextFields>
  implements DeriveContextServiceContract<RepositoryContextFields, RepositoryContextFieldParams> {
  readonly SELECTED_REPOSITORY = 'selectedRepository';
  readonly REPOSITORY_LIST = 'repositoryList';

  updateRepositoryList(repositories: RepositoryList): void {
    this.updateContextProperty(this.REPOSITORY_LIST, repositories);
  }

  getRepositoryList(): RepositoryList {
    return this.getContextPropertyValue(this.REPOSITORY_LIST) || new RepositoryList([]);
  }

  onRepositoryListChanged(callbackFunction: ValueChangeCallback<RepositoryList | undefined>): () => void {
    return this.subscribe(this.REPOSITORY_LIST, callbackFunction);
  }

  // updateSelectedRepository, getSelectedRepository, onSelectedRepositoryChanged …
}
```

**3. Get the Service**

```typescript
import { service, RepositoryContextService } from '@ontotext/workbench-api';

const repositoryContextService = service(RepositoryContextService);
```

**4. Read, Update and Subscribe**

```typescript
const selected = repositoryContextService.getSelectedRepository();

await repositoryContextService.updateSelectedRepository({id: 'my-repo', location: ''});

const unsubscribe = repositoryContextService.onSelectedRepositoryChanged((repository) => {
  // runs now with the current value, then on every change
});

// When the consumer is destroyed:
unsubscribe();
```

## Subscription behaviour

- **The callback runs immediately** with the current value (possibly `undefined`), then on every change. Pass
  `skipFirst = true` to `subscribe` to get only later changes.
- **Validation before a change.** A subscriber may pass a `BeforeChangeValidationPromise`. `validatePropertyChange`
  resolves to `false` if any of them does, and an update method that validates (like `updateSelectedRepository`) then
  leaves the value unchanged. This is how a page with unsaved changes can block switching the repository.
- **`subscribeAll`** subscribes to every string-valued field of the service (`getContextFields()`). Override
  `getContextFields()` if the service has other string properties.
- Always call the returned unsubscribe function when the consumer goes away.

## Restoring values from storage

When a persisted context value changes in `localStorage` (for example in another tab), the
[Persistence API](persistence-api.md) passes the raw string to the context service that `canHandle` the property.
Override `getDeserializedContext()` to map a property to a function that turns that string back into a model;
`RepositoryContextService` parses the stored `RepositoryReference` and looks the repository up in the list.

---

See also: [Developers Guide](../developers-guide.md)
