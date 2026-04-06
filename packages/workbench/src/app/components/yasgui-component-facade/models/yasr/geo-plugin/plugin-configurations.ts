import {YasrPluginName} from '../yasr-plugin-name';
import {PluginConfiguration} from '../plugin-configuration';

/**
 * Maps Yasr plugin names to their corresponding plugin configuration. All keys are optional.
 */
export type PluginConfigurations = Partial<Record<YasrPluginName, PluginConfiguration>>;
