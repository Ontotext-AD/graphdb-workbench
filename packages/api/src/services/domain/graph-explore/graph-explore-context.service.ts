import {ContextService} from '../../context';
import {DeriveContextServiceContract} from '../../../models/context/update-context-method';
import {ValueChangeCallback} from '../../../models/context/value-change-callback';
import {GraphExploreSettings} from '../../../models/graph-explore/graph-explore-settings';
import {DEFAULT_GRAPH_EXPLORE_SETTINGS} from './graph-explore-settings.config';

type GraphExploreContextFields = {
  readonly SETTINGS: string;
};

type GraphExploreContextFieldParams = {
  readonly SETTINGS: GraphExploreSettings;
};

/**
 * Service for managing the graph-explore settings context.
 */
export class GraphExploreContextService extends ContextService<GraphExploreContextFields> implements DeriveContextServiceContract<GraphExploreContextFields, GraphExploreContextFieldParams> {
  readonly SETTINGS = 'graphExploreSettings';

  /**
   * Updates the default graph-explore settings in the context.
   *
   * @param settings - The new default settings object to be set in the context.
   */
  updateSettings(settings: GraphExploreSettings): void {
    this.updateContextProperty(this.SETTINGS, settings);
  }

  /**
   * Subscribes to changes in the default graph-explore settings context.
   *
   * @param callbackFn - A callback function that will be called when the default settings change.
   * @returns A function that, when called, will unsubscribe from the default settings changes.
   */
  onSettingsChanged(callbackFn: ValueChangeCallback<GraphExploreSettings | undefined>): () => void {
    return this.subscribe(this.SETTINGS, callbackFn);
  }

  /**
   * Retrieves the default graph-explore settings stored in the context. When the context holds no
   * value yet, falls back to the built-in {@link DEFAULT_GRAPH_EXPLORE_SETTINGS} configuration.
   *
   * @return the default graph-explore settings.
   */
  getSettings(): GraphExploreSettings {
    return this.getContextPropertyValue<GraphExploreSettings>(this.SETTINGS) ?? DEFAULT_GRAPH_EXPLORE_SETTINGS;
  }
}
