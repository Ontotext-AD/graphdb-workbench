# Logging

The centralized, context-aware logging service for the GraphDB Workbench microfrontend architecture.

## Contents

- [Overview](#overview): per-module, context-aware loggers.
- [Architecture Components](#architecture-components): the logger interface, levels, types, definitions map, and configuration.
- [Core Service Classes](#core-service-classes): `LoggerService` and the `Loggers` factory.
- [How to Add a New Logger Implementation](#how-to-add-a-new-logger-implementation): implement, add the type, register, configure.
- [Usage Examples](#usage-examples): module-specific loggers and multiple destinations.
- [Configuration Options](#configuration-options): level filtering.

## Overview

The logging service provides consistent logging across all microfrontend modules while allowing flexibility in how and
where logs are output. Each module has its own logger instance that tags every message with the module name, making
debugging easier across the distributed application.

## Architecture Components

The logging system consists of several key components:

### 1. Logger Interface
The [`Logger`](../../packages/api/src/models/logging/logger.ts) interface defines the contract that all logger implementations must follow:

```typescript
export interface Logger {
  /**
   * Logs a message based on the specified log level.
   * @param level - The log level determining output behavior
   * @param message - The message to log
   * @param args - Additional arguments for message formatting
   */
  log(level: LogLevel, message: string, args: unknown[]): void;
}
```

### 2. LogLevel Enumeration
Log levels determine the importance and filtering of messages ([`log-level.ts`](../../packages/api/src/models/logging/log-level.ts)).
The values are strings; `toNumericLogLevel()` maps them to `0`–`3` for comparison:

```typescript
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}
```

### 3. LoggerType Enumeration
Defines the available logger implementations:

```typescript
export enum LoggerType {
  CONSOLE = 'console',
}
```

### 4. Logger Definitions Map
The [`logger-definitions.ts`](../../packages/api/src/models/logging/logger-definitions.ts) file contains a map of available logger implementations:

```typescript
export const LOGGER_DEFINITIONS = new Map<LoggerType, Logger>([
  [LoggerType.CONSOLE, service(ConsoleLoggerService)],
]);
```

### 5. Configuration
Which loggers are active and the minimum level come from the `loggerConfig` field
([`LoggerConfig`](../../packages/api/src/models/logging/logger-config.ts)) of the application configuration. The
default configuration is [`assets/configuration.default.json`](../../assets/configuration.default.json); an `env.json`
can point `configUrl` at another file (see `packages/api/src/services/configuration/env.default.json`).

```json
{
  "loggerConfig": {
    "loggers": ["console"],
    "minLogLevel": "DEBUG"
  }
}
```

`LoggerService` reads it from `ConfigurationContextService` on every log call.

## Core Service Classes

### LoggerService
The main service that coordinates logging across different implementations ([`logger-service.ts`](../../packages/api/src/services/logging/logger-service.ts)):

```typescript
export class LoggerService {
  constructor(module: string) {
    this.module = module;
  }

  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, args);
  }
  // ...info, warn, error
}
```

A logger type listed in `loggerConfig.loggers` but missing from `LOGGER_DEFINITIONS` throws an `Error`.

### Loggers Factory
The [`Loggers`](../../packages/api/src/services/logging/loggers.ts) class exposes a factory method that returns one logger instance per module:

```typescript
export class Loggers {
  private static readonly loggerInstances = new Map<string, LoggerService>();

  static getLoggerInstance(module: string): LoggerService {
    if (!this.loggerInstances.has(module)) {
      this.loggerInstances.set(module, new LoggerService(module));
    }
    return this.loggerInstances.get(module)!;
  }
}
```

## How to Add a New Logger Implementation

To add a new logger (e.g., a remote logger), follow these steps:

### Step 1: Create the Logger Implementation

Create a new logger class that implements the [`Logger`](../../packages/api/src/models/logging/logger.ts) interface:

```typescript
// packages/api/src/services/logging/database/database-logger.service.ts
export class DatabaseLoggerService implements Logger {
  log(level: LogLevel, message: string): void {
    const logEntry = { level, message, timestamp: new Date().toISOString() };

    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(error => {
      console.error('Database logging failed:', error);
    });
  }
}
```

### Step 2: Add the Logger Type

Add your new logger type to the [`LoggerType`](../../packages/api/src/models/logging/logger-type.ts) enumeration:

```typescript
export enum LoggerType {
  CONSOLE = 'console',
  DATABASE = 'database'  // Add your new logger type
}
```

### Step 3: Register the Logger

Add your logger to the [`LOGGER_DEFINITIONS`](../../packages/api/src/models/logging/logger-definitions.ts) map, which will create its instance:

```typescript
export const LOGGER_DEFINITIONS = new Map<LoggerType, Logger>([
  [LoggerType.CONSOLE, service(ConsoleLoggerService)],
  [LoggerType.DATABASE, service(DatabaseLoggerService)], // define the new logger here
]);
```

### Step 4: Configure the Logger

Add the new type to `loggerConfig.loggers` in the application configuration
([`assets/configuration.default.json`](../../assets/configuration.default.json)):

```json
{
  "loggerConfig": {
    "loggers": ["console", "database"],
    "minLogLevel": "DEBUG"
  }
}
```

The `loggers` array determines which logger implementations are active. Every message goes to all of them.

## Usage Examples

### Module-Specific Loggers

Each package defines a local `LoggerProvider` that wraps `Loggers.getLoggerInstance(MODULE_NAME)` — see the
[logging conventions](../conventions/logging.md). Then use it in a file:

```typescript
const logger = LoggerProvider.logger;
logger.info('SPARQL query executed successfully', { duration: 234 });
logger.error('Database connection failed', { error: 'timeout' });
```

Output example:
```
[INFO] [Workbench] [9/11/2025, 2:30:45 PM] SPARQL query executed successfully {duration: 234}
[ERROR] [Workbench] [9/11/2025, 2:30:46 PM] Database connection failed {error: 'timeout'}
```

### Multiple Logger Destinations

When multiple loggers are configured, the same message is sent to all active destinations:

```json
{
  "loggerConfig": {
    "loggers": ["console", "database"],
    "minLogLevel": "INFO"
  }
}
```

With this configuration, calling `logger.info('User logged in')` will:
1. Display the message in the browser console
2. Send it to the database logger

## Configuration Options

### Log Level Filtering
Messages below `minLogLevel` are ignored:

- `DEBUG`: Shows all messages
- `INFO`: Shows info, warning, and error messages
- `WARN`: Shows only warning and error messages
- `ERROR`: Shows only error messages

There is no environment-specific override: the level comes only from the configuration file.

---

See also: [Developers Guide](../developers-guide.md)
