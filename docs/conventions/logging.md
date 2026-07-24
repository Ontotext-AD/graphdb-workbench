# Logging

Rules for adding logging. There is a centralized logging service in `packages/api` — use its shared abstractions instead of ad hoc `console.*`.

## Per-package LoggerProvider pattern

Each package defines a local `LoggerProvider` that wraps `Loggers.getLoggerInstance(MODULE_NAME)`. Follow this pattern when adding logging to a package:

```typescript
import { Loggers } from '@ontotext/workbench-api';
const MODULE_NAME = 'MyPackage';
export class LoggerProvider {
  static get logger() {
    return Loggers.getLoggerInstance(MODULE_NAME);
  }
}
```

Examples: `packages/root-config/src/services/logger-provider.ts`, `packages/workbench/src/app/services/logger/logger-provider.ts`.

## See also

- Deep dive (log levels, adding a logger implementation, config): [reference/logging.md](../reference/logging.md)
- [Developers Guide hub](../developers-guide.md)
