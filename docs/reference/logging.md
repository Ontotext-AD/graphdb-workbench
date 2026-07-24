# Logging

The centralized, context-aware logging service for the GraphDB Workbench microfrontend architecture.

## Centralized Logging Service Implementation in GraphDB Workbench

This guide explains the centralized logging service implementation in the GraphDB Workbench microfrontend architecture. 
The logging service provides context-aware logging with configurable output destinations and supports multiple logger implementations.

### Overview

The logging service is designed to provide consistent logging across all microfrontend modules while allowing flexibility in how and 
where logs are output. Each module can have its own logger instance with automatic context identification, making debugging and monitoring 
easier across the distributed application.

### Architecture Components

The logging system consists of several key components:

#### 1. Logger Interface
The [`Logger`](/packages/api/src/models/logging/logger.ts) interface defines the contract that all logger implementations must follow:

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

#### 2. LogLevel Enumeration
Log levels determine the importance and filtering of messages:

```typescript
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}
```

#### 3. LoggerType Enumeration
Defines the available logger implementations:

```typescript
export enum LoggerType {
  CONSOLE = 'console'
}
```

#### 4. Logger Definitions Map
The [`logger-definitions.ts`](/packages/api/src/models/logging/logger-definitions.ts) file contains a map of available logger implementations:

```typescript
export const LOGGER_DEFINITIONS = new Map<LoggerType, Logger>([
  [LoggerType.CONSOLE, service(ConsoleLoggerService)],
]);
```

#### 5. Configuration
The [`logger.config.json`](/packages/api/src/services/logging/logger.config.json) file controls which loggers are active:

```json
{
  "minLogLevel": 0,
  "loggers": ["console"]
}
```

### Core Service Classes

#### LoggerService
The main service that coordinates logging across different implementations ([`logger-service.ts`](/packages/api/src/services/logging/logger-service.ts)):

```typescript
export class LoggerService {
  constructor(module: string) {
    this.module = module;
  }

  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, args);
  }
  // ...other logging methods
}
```

#### Loggers Factory
The [`Loggers`](/packages/api/src/services/logging/loggers.ts) class exposes factory method to get module-specific logger instances:

```typescript
export class Loggers {
  private static loggerInstances = new Map<Module, LoggerService>();

  static getLoggerInstance(module: string): LoggerService {
    if (!this.loggerInstances.has(module)) {
      this.loggerInstances.set(module, new LoggerService(module));
    }
    return this.loggerInstances.get(module)!;
  }
}
```



### How to Add a New Logger Implementation

To add a new logger (e.g., a database logger or file logger), follow these steps:

#### Step 1: Create the Logger Implementation

Create a new logger class that implements the [`Logger`](/packages/api/src/models/logging/logger.ts) interface:

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
      console.log(`[DB-FALLBACK] ${message}`);
    });
  }
}
```

#### Step 2: Add the Logger Type

Add your new logger type to the [`LoggerType`](/packages/api/src/models/logging/logger-type.ts) enumeration:

```typescript
export enum LoggerType {
  CONSOLE = 'console',
  DATABASE = 'database'  // Add your new logger type
}
```

#### Step 3: Register the Logger

Add your logger to the [`LOGGER_DEFINITIONS`](/packages/api/src/models/logging/logger-definitions.ts) map, which will create its instance:

```typescript
export const LOGGER_DEFINITIONS = new Map<LoggerType, Logger>([
  [LoggerType.CONSOLE, service(ConsoleLoggerService)],
  [LoggerType.DATABASE, service(DatabaseLoggerService)], // define the new logger here
]);
```

#### Step 4: Configure the Logger

Update the [`logger.config.json`](/packages/api/src/services/logging/logger.config.json) to include your new logger:

```json
{
  "minLogLevel": 0,
  "loggers": ["console", "database"]
}
```

The `loggers` array determines which logger implementations will be active. You can include multiple loggers to send the same log message to different destinations simultaneously.

### Usage Examples

#### Basic Usage with Module-Specific Loggers

```typescript
// In any microfrontend module define a module specific wrapper for the logger
import { Loggers } from '@ontotext/workbench-api';

const MODULE_NAME = 'Workbench';

/**
 * Logger for the Workbench module.
 */
export class WorkbenchLoggerService {

  /**
   * Gets the logger instance for the Workbench module.
   *
   * @returns LoggerService instance for the Workbench module
   */
  static get logger() {
    return Loggers.getLoggerInstance(MODULE_NAME);
  }
}
```

Then use it in a file:

```typescript
const logger = WorkbenchLoggerService.logger;
logger.info('SPARQL query executed successfully', { duration: 234 });
logger.error('Database connection failed', { error: 'timeout' });
```

Output example:
```
[INFO] [workbench] 9/11/2025, 2:30:45 PM SPARQL query executed successfully {"duration":234}
[ERROR] [workbench] 9/11/2025, 2:30:46 PM Database connection failed {"error":"timeout"}
```

#### Multiple Logger Destinations

When multiple loggers are configured, the same message is sent to all active destinations:

```json
{
  "minLogLevel": 1,
  "loggers": ["console", "database"]
}
```

With this configuration, calling `logger.info('User logged in')` will:
1. Display the message in the browser console
2. Store it in the database

### Configuration Options

#### Log Level Filtering
The system respects log level filtering. Messages below the configured level are ignored:

- `DEBUG = 0`: Shows all messages
- `INFO = 1`: Shows info, warning, and error messages
- `WARN = 2`: Shows only warning and error messages  
- `ERROR = 3`: Shows only error messages

#### Environment-Specific Behavior
The logging service automatically adjusts behavior based on the environment:

- **Development mode**: Uses the configured log level from `logger.config.json`
- **Production mode**: Automatically sets minimum level to `INFO` regardless of configuration

---

See also: [Developers Guide](../developers-guide.md)
