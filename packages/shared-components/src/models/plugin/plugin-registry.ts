import {RouteModel, ExtensionPoint, ExternalMenuModel} from '@ontotext/workbench-api';

export interface PluginRegistry {
  get(extensionPoint: ExtensionPoint.MAIN_MENU): ExternalMenuModel;
  get(extensionPoint: ExtensionPoint.ROUTE): RouteModel;
}
