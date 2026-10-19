import {ContextService} from '../../context';
import {DeriveContextServiceContract} from '../../../models/context/update-context-method';
import {GraphNavigatorSettings} from '../../../models/graph-navigator';

type GraphNavigatorContextFields = {
  readonly SETTINGS: string;
};

type GraphNavigatorContextFieldParams = {
  readonly SETTINGS: GraphNavigatorSettings | undefined;
};

/**
 * Service for managing the graph-navigator settings of the active repository.
 */
export class GraphNavigatorContextService extends ContextService<GraphNavigatorContextFields> implements DeriveContextServiceContract<GraphNavigatorContextFields, GraphNavigatorContextFieldParams> {
  readonly SETTINGS = 'graphNavigatorSettings';

  /**
   * Updates the graph-navigator settings in the context.
   *
   * @param settings - The settings of the active repository, or `undefined` while they are not loaded.
   */
  updateSettings(settings: GraphNavigatorSettings | undefined): void {
    this.updateContextProperty(this.SETTINGS, settings);
  }

  /**
   * Retrieves the graph-navigator settings stored in the context.
   *
   * @returns The settings of the active repository, or `undefined` while they are not loaded.
   */
  getSettings(): GraphNavigatorSettings | undefined {
    return this.getContextPropertyValue<GraphNavigatorSettings>(this.SETTINGS);
  }
}
