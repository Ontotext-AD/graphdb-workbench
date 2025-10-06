import {PluginRegistry, SingleSpa} from '@ontotext/workbench-api';

declare global {
  interface Window {
    wbDevMode: boolean;
    PluginRegistry: PluginRegistry;
    singleSpa: SingleSpa;
  }
}

export {};
