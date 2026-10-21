import {ErrorBase} from '../../error';
import {GraphNavigatorSettingsError} from './graph-navigator-settings-error';

/**
 * Error thrown when the backend rejects a graph-navigator settings file.
 * Holds the individual validation errors the backend returned.
 */
export class GraphNavigatorSettingsUploadError extends ErrorBase {
  constructor(readonly errors: GraphNavigatorSettingsError[]) {
    super('The settings file was rejected');
  }
}
