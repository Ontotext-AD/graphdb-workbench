import {SingleSpa} from './src/models/single-spa/single-spa';
import {PluginRegistry} from './src/models/plugin-registry/plugin-registry';

declare global {
  interface Window {
    singleSpa: SingleSpa;
    wbDevMode: boolean;
    PluginRegistry: PluginRegistry
  }
}

export {};
