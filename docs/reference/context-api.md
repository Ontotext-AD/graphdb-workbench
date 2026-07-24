# Context API

Stateful context services and the `ContextService` abstraction for managing application state in GraphDB Workbench.

## Stateful Context services and Context API implementation in GraphDB Workbench

This guide introduces the `ContextService` API, a versatile abstraction for managing application context in the GraphDB 
Workbench application. Each view in the application is expected to implement a concrete version of the ContextService 
API, tailored to its specific requirements.

### Overview

The `ContextService` API facilitates state management by:

* Allowing context value updates.
* Notifying subscribers about context changes.
* Enforcing type safety with generic constraints.

The API is implemented as an abstract class, requiring developers to define specific fields and methods for their 
application's needs.

### Core Concepts

#### Abstract `ContextService`

The `ContextService` class is generic and requires a type parameter `TFields` that defines the fields the service can 
handle. Each field corresponds to a property of the service and is managed via the context map.

Key methods include:

`updateContextProperty`: Updates the value of a property.

`getContextPropertyValue`: Retrieves the current value of a property.

`subscribe`: Registers a callback to be notified of property value changes.

#### Utility Types

`SnakeToPascalCase`

Converts `SNAKE_CASE` field names to `PascalCase` for method naming.

`DeriveContextServiceContract`

Generates update methods for each field. For example, a field `SELECTED_REPOSITORY` generates an 
`updateSelectedRepository` method.

---

### Implementation Example: `RepositoryContextService`

The `RepositoryContextService` class manages repository-related application context for views in the GraphDB Workbench. 
It implements the abstract `ContextService` and provides methods for updating and subscribing to repository-related data.

#### Fields
```typescript
readonly SELECTED_REPOSITORY = 'selectedRepository';
readonly REPOSITORY_LIST = 'repositoryList';
```
These fields define the context properties managed by the service.

#### Methods

**Updating Context**

`updateSelectedRepository(repository: Repository | undefined): void`
Updates the selected repository.

`updateRepositoryList(repositories: RepositoryList): void`
Updates the list of repositories.

**Subscribing to Changes**

`onSelectedRepositoryChanged(callbackFunction: ValueChangeCallback<Repository | undefined>): () => void`
Subscribes to changes in the selected repository.

`onRepositoriesChanged(callbackFunction: ValueChangeCallback<RepositoryList | undefined>): () => void`
Subscribes to changes in the repository list.

---

### Step-by-Step Guide to Using `ContextService`

**1. Define Context Fields and Parameters**

Define the fields and their corresponding parameter types:

```typescript
type RepositoryContextFields = {
  readonly SELECTED_REPOSITORY: string;
  readonly REPOSITORY_LIST: string;
};

type RepositoryContextFieldParams = {
  readonly SELECTED_REPOSITORY: Repository;
  readonly REPOSITORY_LIST: RepositoryList;
};
```

**2. Extend ContextService**

Implement a concrete class that extends `ContextService`:

```typescript
export class RepositoryContextService extends ContextService<RepositoryContextFields> implements DeriveContextServiceContract<RepositoryContextFields, RepositoryContextFieldParams> {
  readonly SELECTED_REPOSITORY = 'selectedRepository';
  readonly REPOSITORY_LIST = 'repositoryList';

  updateSelectedRepository(repository: Repository | undefined): void {
    this.updateContextProperty(this.SELECTED_REPOSITORY, repository);
  }

  onSelectedRepositoryChanged(callbackFunction: ValueChangeCallback<Repository | undefined>): () => void {
    return this.subscribe(this.SELECTED_REPOSITORY, callbackFunction);
  }

  updateRepositoryList(repositories: RepositoryList): void {
    this.updateContextProperty(this.REPOSITORY_LIST, repositories);
  }

  onRepositoriesChanged(callbackFunction: ValueChangeCallback<RepositoryList | undefined>): () => void {
    return this.subscribe(this.REPOSITORY_LIST, callbackFunction);
  }
}
```

**3. Using the Service**

Import the Service using the `ServiceProvider` API:

> Warning: Everything in the api package must be imported using the alias `@ontotext/workbench-api` and not by relative 
> or absolute paths. The reason for this is that the api module is a separate package managed as a microservice which is
> loaded using import maps where the alias is defined.


```typescript
import { ServiceProvider, RepositoryContextService } from '@ontotext/workbench-api';
// Get the service instance
const repositoryContextService = ServiceProvider.get(RepositoryContextService);
```

Update Context Values:

```typescript

const repository: Repository = { id: 1, name: 'Repo1' };
repositoryContextService.updateSelectedRepository(repository);

const repositoryList: RepositoryList = [{ id: 1, name: 'Repo1' }, { id: 2, name: 'Repo2' }];
repositoryContextService.updateRepositoryList(repositoryList);
```

**4. Subscribe to Changes**

```typescript
const unsubscribeSelectedRepository = repositoryContextService.onSelectedRepositoryChanged((newRepository) => {
  console.log('Selected repository changed:', newRepository);
});

const unsubscribeRepositoryList = repositoryContextService.onRepositoriesChanged((newList) => {
  console.log('Repository list changed:', newList);
});

// To unsubscribe:
unsubscribeSelectedRepository();
unsubscribeRepositoryList();
```
---

### Summary

The `ContextService` API provides a simple yet powerful mechanism for managing context in GraphDB Workbench views. By
extending `ContextService`, developers can create view-specific services that streamline state management and improve 
code maintainability.

---

See also: [Developers Guide](../developers-guide.md)
