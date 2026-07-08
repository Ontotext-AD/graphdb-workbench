import {ContextService} from '../../context';
import {DeriveContextServiceContract} from '../../../models/context/update-context-method';
import {ValueChangeCallback} from '../../../models/context/value-change-callback';
import {GraphExploreSettings} from '../../../models/graph-explore/graph-explore-settings';
import {DEFAULT_GRAPH_EXPLORE_SETTINGS} from './graph-explore-settings.config';

type GraphExploreContextFields = {
  readonly DEFAULT_SETTINGS: string;
};

type GraphExploreContextFieldParams = {
  readonly DEFAULT_SETTINGS: GraphExploreSettings;
};

/**
 * Service for managing the graph-explore settings context.
 */
export class GraphExploreContextService extends ContextService<GraphExploreContextFields> implements DeriveContextServiceContract<GraphExploreContextFields, GraphExploreContextFieldParams> {
  readonly DEFAULT_SETTINGS = 'graphExploreDefaultSettings';

  /**
   * Updates the default graph-explore settings in the context.
   *
   * @param settings - The new default settings object to be set in the context.
   */
  updateDefaultSettings(settings: GraphExploreSettings): void {
    this.updateContextProperty(this.DEFAULT_SETTINGS, settings);
  }

  /**
   * Subscribes to changes in the default graph-explore settings context.
   *
   * @param callbackFn - A callback function that will be called when the default settings change.
   * @returns A function that, when called, will unsubscribe from the default settings changes.
   */
  onDefaultSettingsChanged(callbackFn: ValueChangeCallback<GraphExploreSettings | undefined>): () => void {
    return this.subscribe(this.DEFAULT_SETTINGS, callbackFn);
  }

  /**
   * Retrieves the default graph-explore settings from the context, falling back to the
   * {@link DEFAULT_GRAPH_EXPLORE_SETTINGS} configuration when no value has been set.
   *
   * @return the default graph-explore settings.
   */
  getDefaultSettings(): GraphExploreSettings {
    return this.getContextPropertyValue<GraphExploreSettings>(this.DEFAULT_SETTINGS) ?? DEFAULT_GRAPH_EXPLORE_SETTINGS;
  }
}
