import {RouteModel} from '../routing/external-route-item-model';

export interface PluginRegistry {
  get(extensionPoint: 'route'): RouteModel
}
