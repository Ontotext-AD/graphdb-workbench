import {SparqlDataProviderSettings} from '../../../../models/graph-navigator';

/**
 * The `repositories/{repositoryId}/graph-navigator/settings` response: a Reactodia
 * `SparqlDataProviderSettings` object as-is, plus the `uploaded` tag.
 */
export interface GraphNavigatorSettingsResponse extends SparqlDataProviderSettings {
  /** Whether the settings were uploaded for the repository. `false` means the defaults are in use. */
  uploaded: boolean;
}
