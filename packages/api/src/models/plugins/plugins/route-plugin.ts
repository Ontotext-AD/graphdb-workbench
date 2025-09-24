import {Plugin} from '../plugins/extension-models/plugin';

/**
 * Represents a route plugin item in the application's routing system.
 * This class encapsulates all properties needed to define a route
 * including its URL, associated module, controller, and access permissions.
 */
export class RoutePlugin extends Plugin {
  private _url: string;
  private _module: string;
  private _path: string;
  private _chunk: string;
  private _controller: string;
  private _templateUrl: string;
  private _title?: string;
  private _reloadOnSearch?: boolean;
  private _helpInfo?: string;
  private _documentationUrl?: string;
  private _allowAuthorities?: string[];

  constructor(routeItem: Partial<RoutePlugin>) {
    super();
    this._url = routeItem.url ?? '';
    this._module = routeItem.module ?? '';
    this._path = routeItem.path ?? '';
    this._chunk = routeItem.chunk ?? '';
    this._controller = routeItem.controller ?? '';
    this._templateUrl = routeItem.templateUrl ?? '';
    this._title = routeItem.title;
    this._reloadOnSearch = routeItem.reloadOnSearch;
    this._helpInfo = routeItem.helpInfo;
    this._documentationUrl = routeItem.documentationUrl;
    this._allowAuthorities = routeItem.allowAuthorities;
  }

  get url(): string {
    return this._url;
  }

  set url(url: string) {
    this._url = url;
  }

  get module(): string {
    return this._module;
  }

  set module(module: string) {
    this._module = module;
  }

  get path(): string {
    return this._path;
  }

  set path(path: string) {
    this._path = path;
  }

  get chunk(): string {
    return this._chunk;
  }

  set chunk(chunk: string) {
    this._chunk = chunk;
  }

  get controller(): string {
    return this._controller;
  }

  set controller(controller: string) {
    this._controller = controller;
  }

  get templateUrl(): string {
    return this._templateUrl;
  }

  set templateUrl(templateUrl: string) {
    this._templateUrl = templateUrl;
  }

  get title(): string | undefined{
    return this._title;
  }

  set title(title: string) {
    this._title = title;
  }

  get reloadOnSearch(): boolean | undefined {
    return this._reloadOnSearch;
  }

  set reloadOnSearch(reloadOnSearch: boolean | undefined) {
    this._reloadOnSearch = reloadOnSearch;
  }

  get helpInfo(): string | undefined {
    return this._helpInfo;
  }

  set helpInfo(helpInfo: string) {
    this._helpInfo = helpInfo;
  }

  get documentationUrl(): string | undefined {
    return this._documentationUrl;
  }

  set documentationUrl(documentationUrl: string | undefined) {
    this._documentationUrl = documentationUrl;
  }

  get allowAuthorities(): string[] | undefined{
    return this._allowAuthorities;
  }

  set allowAuthorities(allowAuthorities: string[]) {
    this._allowAuthorities = allowAuthorities;
  }
}
