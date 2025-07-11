import {RouteModel} from '../routing/external-route-item-model';
import {ExtensionPoint} from './extension-point';

export interface PluginRegistry {
  get(extensionPoint: ExtensionPoint.ROUTE): RouteModel
}
