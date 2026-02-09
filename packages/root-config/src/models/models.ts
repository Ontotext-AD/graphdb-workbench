import {
  navigateToUrl,
} from 'single-spa';

export type AppModule = () => Promise<any>;

export interface AppModules {
  [key: string]: AppModule;
}

export interface SingleSpaGlobal {
  navigateToUrl?: typeof navigateToUrl;
}

export interface NavigationEvent extends CustomEvent {
  detail: {
    oldUrl: string;
    newUrl: string;
    cancelNavigation?: () => void;
  };
}

export interface AppChangeEvent extends CustomEvent {
  detail: {
    newAppStatuses: any;
  };
}

export interface LayoutAttr {
  name: string;
  value: string;
}

export interface BaseLayout {
  base: string;
  routes: Route[];
}

export interface Route {
  type: string;
  name?: string;
  path?: string;
  exact?: boolean;
  routes?: Route[];
  default?: boolean;
  attrs?: LayoutAttr[];
}

export interface RouteDefinition {
  path?: string;
  default: boolean;
}
