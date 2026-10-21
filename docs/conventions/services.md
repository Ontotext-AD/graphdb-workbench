# Service conventions

Rules for Angular services in `packages/workbench`.

- One responsibility per service.
- Singletons use `providedIn: 'root'`.
- Inject dependencies with the `inject()` function, not constructor injection.
- API-package services are not Angular DI services — get them with
  `ServiceProvider.get()` / `service()` (see [architecture](architecture.md#serviceprovider-and-the-service-helper)).
  Shared, cross-package logic belongs there, not in a workbench service.
- Don't also list a `providedIn: 'root'` service in a component's `providers`; that creates a second instance.
- No `Onto` prefix on workbench classes: `DialogProviderService`, not `OntoDialogService`.
