import {RouteModel} from '../routing/external-route-item-model';
import {ExtensionPoint} from './extension-point';
import {ExternalMenuModel} from './external-menu-model';

export interface PluginRegistry {
  get(extensionPoint: ExtensionPoint.ROUTE): RouteModel
  get(extensionPoint: ExtensionPoint.MAIN_MENU): ExternalMenuModel
}
