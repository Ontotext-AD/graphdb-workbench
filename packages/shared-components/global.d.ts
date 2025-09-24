import {PluginRegistry} from '../api/src/services/plugins';
import {SingleSpa} from '../api/src/models/single-spa';

declare global {
  interface Window {
    wbDevMode: boolean;
    PluginRegistry: PluginRegistry;
    singleSpa: SingleSpa;
  }
}

export {};
