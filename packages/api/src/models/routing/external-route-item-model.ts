export interface ExternalRouteItemModel {
  url: string;
  module: string;
  path: string;
  chunk: string;
  controller: string;
  templateUrl: string;
  title?: string;
  reloadOnSearch?: boolean;
  helpInfo?: string;
  documentationUrl?: string;
  allowAuthorities?: string[];
}

export type RouteModel = ExternalRouteItemModel[];
