import {RenderingMode} from './yasgui/rendering-mode';
import {TabQueryModel} from './yasgui/tab-query-model';
import {YasguiResetFlags} from './yasgui-reset-flags';
import {Tab} from './yasgui/yasgui';
import {OngoingRequestsInfo} from './ongoing-requests-info';

/**
 * Represents the public API surface of the underlying <ontotext-yasgui> custom element.
 * This interface is used to type the native element reference passed into {@link YasguiComponent}
 * so that the wrapper is not self-referential and the compiler rejects unrelated objects.
 */
export interface OntotextYasguiElement extends HTMLElement {
  changeRenderMode(newRenderMode: RenderingMode): Promise<void>;
  setQuery(query: string): Promise<void>;
  query(renderingMode?: RenderingMode): Promise<never>;
  getQuery(): Promise<string>;
  isQueryValid(): Promise<boolean>;
  openTab(queryModel?: TabQueryModel): Promise<Tab>;
  getQueryMode(): Promise<string>;
  getQueryType(): Promise<string>;
  getEmbeddedResultAsJson(): Promise<unknown>;
  getEmbeddedResultAsCSV(): Promise<unknown>;
  hideYasqeActionButton(yasqeActionButtonNames: string | string[]): Promise<void>;
  showYasqeActionButton(yasqeActionButtonNames: string | string[]): Promise<void>;
  abortQuery(): Promise<never>;
  getOngoingRequestsInfo(): Promise<OngoingRequestsInfo>;
  abortAllRequests(): Promise<never>;
  reInitYasgui(flags: YasguiResetFlags): Promise<never>;
  setTheme(themeName: string): Promise<void>;
}

