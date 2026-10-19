import {ContextService} from '../../context';
import {DeriveContextServiceContract} from '../../../models/context/update-context-method';
import {GraphNavigatorSettings} from '../../../models/graph-navigator';

type GraphNavigatorContextFields = {
  readonly SETTINGS: string;
  readonly AUTOCOMPLETE_WARNED: string;
};

type GraphNavigatorContextFieldParams = {
  readonly SETTINGS: GraphNavigatorSettings | undefined;
  readonly AUTOCOMPLETE_WARNED: boolean;
};

/**
 * Service for managing the graph-navigator settings of the active repository.
 */
export class GraphNavigatorContextService extends ContextService<GraphNavigatorContextFields> implements DeriveContextServiceContract<GraphNavigatorContextFields, GraphNavigatorContextFieldParams> {
  readonly SETTINGS = 'graphNavigatorSettings';
  readonly AUTOCOMPLETE_WARNED = 'graphNavigatorAutocompleteWarned';

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

  /**
   * Updates whether the autocomplete warning was shown for the current repository selection.
   *
   * @param warned - `true` once the warning is shown, `false` when another repository is selected.
   */
  updateAutocompleteWarned(warned: boolean): void {
    this.updateContextProperty(this.AUTOCOMPLETE_WARNED, warned);
  }

  /**
   * Retrieves whether the autocomplete warning was shown for the current repository selection.
   *
   * @returns `true` if the warning was shown.
   */
  isAutocompleteWarned(): boolean {
    return this.getContextPropertyValue<boolean>(this.AUTOCOMPLETE_WARNED) ?? false;
  }
}
