import {SingleSpa} from './src/models/single-spa';
import {PluginRegistry} from './src/services/plugins';

declare global {
  interface Window {
    singleSpa: SingleSpa;
    wbDevMode: boolean;
    PluginRegistry: PluginRegistry
  }
}

export {};
