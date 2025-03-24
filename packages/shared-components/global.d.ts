import {PluginRegistry} from './src/models/plugin/plugin-registry';
import {SingleSpa} from './src/models/single-spa/single-spa';

declare global {
  interface Window {
    wbDevMode: boolean;
    PluginRegistry: PluginRegistry;
    singleSpa: SingleSpa;
  }
}

export {}
