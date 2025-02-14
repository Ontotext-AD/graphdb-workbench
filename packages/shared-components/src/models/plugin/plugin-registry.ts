import {ExternalMenuModel} from '../../components/onto-navbar/external-menu-model';

export interface PluginRegistry {
  get(extensionPoint: string): ExternalMenuModel;
}
