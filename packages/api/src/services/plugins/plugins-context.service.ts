import {ContextService} from '../context';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {LifecycleHooks} from '../../providers/service/lifecycle-hooks';
import {PluginsManifest} from '../../models/plugins';

type PluginsContextFields = {
  readonly PLUGINS_MANIFEST: string;
}

type PluginsContextFieldParams = {
  readonly PLUGINS_MANIFEST: PluginsManifest;
}

/**
 * Service for managing plugins context in the application.
 */
export class PluginsContextService extends ContextService<PluginsContextFields> implements DeriveContextServiceContract<PluginsContextFields, PluginsContextFieldParams>, LifecycleHooks {
  readonly PLUGINS_MANIFEST = 'pluginsManifest';

  /**
   * Updates the plugins manifest in the context.
   * @param pluginsManifest - The plugins manifest to set in the context.
   */
  updatePluginsManifest(pluginsManifest: PluginsManifest): void {
    this.updateContextProperty(this.PLUGINS_MANIFEST, pluginsManifest);
  }

  /**
   * Subscribes to changes in the plugins manifest.
   *
   * @param callbackFn - The callback function that will be invoked when plugins manifest changes
   * @returns A function that can be called to unsubscribe from the changes
   */
  onPluginsManifestChanged(callbackFn: ValueChangeCallback<PluginsManifest | undefined>) {
    return this.subscribe(this.PLUGINS_MANIFEST, callbackFn);
  }

  /**
   * Retrieves the current plugins manifest from the context.
   * @returns The current plugins manifest, or undefined if not set.
   */
  getPluginsManifest(): PluginsManifest | undefined {
    return this.getContextPropertyValue(this.PLUGINS_MANIFEST);
  }
}
