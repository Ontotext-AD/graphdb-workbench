import {Loggers} from '@ontotext/workbench-api';

/** Module identifier for legacy module logger */
const LEGACY_MODULE = 'LEGACY_MODULE';

/**
 * Service class that provides logging functionality for legacy workbench components.
 * Acts as a bridge between the legacy AngularJS code and the new logging infrastructure.
 */
export class LoggerProvider {
    /**
     * Gets the logger instance specifically configured for legacy module components.
     * @returns {Logger} Logger instance for the legacy module
     */
    static get logger() {
        return Loggers.getLoggerInstance(LEGACY_MODULE);
    }
}
