import {PluginRegistry} from './src/models/plugin/plugin-registry';

declare global {
  interface Window {
    wbDevMode: boolean;
    PluginRegistry: PluginRegistry
  }
}

export {}
