import {SparqlDataProviderSettings} from './sparql-data-provider-settings';

/**
 * The graph-navigator settings of a repository: the Reactodia query preset, tagged with where it comes
 * from. The tag sits next to the preset's own properties, as the endpoint returns them.
 */
export interface GraphNavigatorSettings extends SparqlDataProviderSettings {
  /** Whether the settings were uploaded for the repository. `false` means the defaults are in use. */
  uploaded: boolean;
}
