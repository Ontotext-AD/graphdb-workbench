import {Model} from '../common';
import {SparqlDataProviderSettings} from './sparql-data-provider-settings';

/**
 * The graph-navigator settings of a repository: the Reactodia query preset and where it comes from.
 */
export class GraphNavigatorSettings extends Model<GraphNavigatorSettings> {
  /** Whether the settings were uploaded for the repository. `false` means the defaults are in use. */
  private readonly uploaded: boolean;

  /** The query preset the diagram uses. */
  private readonly providerSettings: SparqlDataProviderSettings;

  constructor(data: {
    uploaded: boolean;
    providerSettings: SparqlDataProviderSettings;
  }) {
    super();
    this.uploaded = data.uploaded;
    this.providerSettings = data.providerSettings;
  }

  isUploaded(): boolean {
    return this.uploaded;
  }

  getProviderSettings(): SparqlDataProviderSettings {
    return this.providerSettings;
  }
}
