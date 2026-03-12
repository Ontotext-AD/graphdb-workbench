import {RenderingMode} from './rendering-mode';
import {YasguiOrientation} from './yasgui-orientation';
import {YasguiQueryHttpMethod} from './yasgui-query-http-method';
import {YasqeMode} from './yasqe-mode';
import {YasrPluginName} from './yasr-plugin-name';
import {TranslationBundles} from '../../../models/translation-bundles';
import {HttpHeaders} from '@ontotext/workbench-api';
import {YasqeActionButtonDefinition} from './yasqe-action-button-definition';
import {Prefixes} from '../../../models/prefixes';
import {BeforeUpdateQueryResult} from './before-update-query-result';
import {YasrToolbarPlugin} from './yasr-toolbar-plugin';

/**
 * Holds all configurations related with ontotext-yasgui-web-component.
 */
export class OntotextYasguiConfig {
  /**
   * Configure what part of the yasgui should be rendered.
   * The value have to be one of the {@link RenderingMode} options.
   */
  private render: RenderingMode;
  /**
   * Configure the yasgui layout orientation.
   * The value have to be one of the {@link YasguiOrientation} options.
   */
  private orientation: YasguiOrientation;
  /**
   * If the yasgui tabs should be rendered or not.
   */
  private showEditorTabs: boolean;
  /**
   * If the yasr tabs should be rendered or not.
   */
  private showResultTabs: boolean;
  /**
   * If the result information header of YASR should be rendered or not.
   */
  private showResultInfo: boolean;
  /**
   * If the toolbar with render mode buttons should be rendered or not.
   */
  private showToolbar: boolean;
  /**
   * If the control bar should be rendered or not.
   */
  private showControlBar: boolean;
  /**
   * If "Run" button should be rendered or not. Default is true.
   */
  private showQueryButton: boolean;
  /**
   * Flag that controls displaying the loader during the run query process.
   */
  private showQueryLoader: boolean;
  /**
   * The sparql endpoint which will be used when a query request is made.
   * It is important to note that if the endpoint configuration is passed as string, it will be persisted when first
   * time initializes the instance with specific {@link OntotextYasguiConfig#componentId}. Subsequent query executions
   * will use the endpoint stored in the persistence regardless if the configuration is changed.
   * If the endpoint is defined as a function, it will be called before each query execution.
   *
   * @type {string | ((yasgui: Yasgui) => string)}
   */
  private endpoint: string;
  /**
   * Key -> value translations as JSON. If the language is supported, then not needed to pass all label values.
   * If pass a new language then all label's values have to be present, otherwise they will be translated to the default
   * English language.
   */
  private i18n: TranslationBundles | undefined;
  /**
   * The request type.
   * The value have to be one of the {@link YasguiQueryHttpMethod} options.
   */
  private method: YasguiQueryHttpMethod;
  /**
   * A function which should return an object with request header types and values.
   * For instance the function can return an object something like:
   *  {
   *      'Content-Type': 'application/x-www-form-urlencoded',
   *      'X-GraphDB-Local-Consistency': 'updating',
   *      'X-GraphDB-Track-Alias': trackAlias,
   *      'X-Requested-With': 'XMLHttpRequest'
   *      ...
   *  };
   */
  private headers: HttpHeaders | undefined;
  /**
   * The value of "infer" parameter when a query is executed.
   * Default value is true.
   */
  private infer: boolean;
  /**
   * If set to true, the 'infer' value cannot be changed.
   * Default value is false.
   */
  private immutableInfer: boolean;
  /**
   * The value of "sameAs" parameter when a query is executed.
   * Default value is true.
   */
  private sameAs: boolean;
  /**
   * If set to true, the 'sameAs' value cannot be changed.
   * Default value is false.
   */
  private immutableSameAs: boolean;
  /**
   * If the Yasgui state should be cleared to the initial state.
   * Default value is false.
   */
  private clearState: boolean;
  /**
   * If the configured endpoint should be preconfigured to any new opened editor tab.
   */
  private copyEndpointOnNewTab: boolean;
  /**
   * Yasgui use browser local storage to persist its state. In its state, yasgui holds information about:
   * 1. default query when a tab is opened;
   * 2. YASR plugins configuration;
   * 3. selected plugin;
   * 4. request configuration: endpoint, headers, method and so on;
   * 5. opened tabs;
   * 5. which tab is active.
   * The <code>componentId</code> configuration options defines uniqueness of this persistent state. Passed value will be used to generate
   * the key which will be used into browser local store. For example if value is "123" then the key will be "yasgui__123".
   * Default value is "ontotext-yasgui-config".
   */
  private componentId: string | undefined;
  /**
   * The value have to be one of the {@link YasqeMode} options.
   */
  private yasqeMode: YasqeMode;
  /**
   * Default query when a tab is opened.
   */
  private query: string | undefined;
  /**
   * Initial query when yasgui is rendered if not set the default query will be set.
   */
  private initialQuery: string | undefined;
  /**
   * The translation label key that should be used to fetch the default tab name when a new tab is created.
   */
  private defaultTabNameLabelKey: string | undefined;
  /**
   * Action button definitions which can be plugged in the yasqe extension point.
   */
  private yasqeActionButtons: YasqeActionButtonDefinition[] | undefined;
  /**
   * Function which is used by yasgui internally to create a shareable links. We
   * expose it here just to allow the share button to be hidden but in reality it
   * doesn't work due to a bug in the yasgui configuration merge code.
   */
  private createShareableLink: ((yasqe: unknown) => string | null) | null;
  /**
   * This allows to skip the code in yasgui handling url parameters and internally
   * initializing the editor using them.
   */
  private populateFromUrl: boolean;
  /**
   * Object with uris and their corresponding prefixes.
   */
  private prefixes: Prefixes | undefined;
  /**
   * The name of plugin which have to be active when yasr is created.
   * The value have to be one of the {@link YasrPluginName} options.
   */
  private defaultPlugin: YasrPluginName;
  /**
   * Describes the order of how plugins will be displayed.
   * The values of the array have to be {@link YasrPluginName} options.
   * For example: ["extended_table", "response"]
   */
  private pluginOrder: [YasrPluginName.EXTENDED_TABLE, YasrPluginName.RAW_RESPONSE];
  /**
   * Map with configuration of given plugin. The key of map is the name of a plugin. The value is any object which
   * fields are supported by the plugin configuration.
   */
  private pluginsConfigurations: Record<YasrPluginName, unknown> | undefined;
  /**
   * Defines pageSize of pagination.
   * Default value is 10.
   */
  private pageSize: number;
  /**
   * Flag that controls usage of pagination. When it is true then pagination will be used.
   */
  private paginationOn: boolean;
  /**
   * A flag that controls creation of "Download as" dropdown. When false, the dropdown will not be created.
   * Default value is true.
   */
  private downloadAsOn: boolean;
  /**
   * Maximum length of response which will be persisted. If response is bigger it will not be persisted in browser
   * local store.
   * Default value is 100000.
   */
  private maxPersistentResponseSize: number;
  /**
   * Registered yasqe autocomplete handlers. Every handler is mapped by its name.
   */
  private yasqeAutocomplete: Record<string, unknown> | undefined;
  /**
   * Flag that controls update operations. If this flag is set to true, then all update operations will be disabled.
   * For virtual repositories only select queries are allowed.
   * Default value is false.
   */
  private isVirtualRepository: boolean;
  /**
   * This function will be called before the update query is executed. The client can abort execution of query for some
   * reason and can provide a message or label key for the abort reason.
   */
  private beforeUpdateQuery: ((query: string, tabId: string) => Promise<BeforeUpdateQueryResult>) | undefined;
  /**
   * This function will be called before and after execution of an update query. Depends on results a corresponding
   * result message info will be generated.
   */
  private getRepositoryStatementsCount: (() => Promise<number>) | undefined;
  /**
   * If this function is present, then an "Abort query" button wil be displayed when a query is running. If the  button
   * is clicked then this function will be invoked after the abort operation was triggered. The button will be visible
   * until "ontotext-yasgui-web-component" client resolves the returned promise.
   */
  private onQueryAborted: ((req: unknown) => Promise<void>) | undefined;
  /**
   * All passed plugins will be displayed on the right of the ontotext-yasgui-web-component toolbar.
   */
  private yasrToolbarPlugins: YasrToolbarPlugin[] | undefined;
  /**
   * If this function is present, then it will be called on every one result cell.
   * @param binding - {Parser.BindingValue} binding value that will be shown into a cell.
   * @param prefixes - Object with uris and their corresponding prefixes.
   *
   * @returns - html that will display in the cell.
   */
  private getCellContent: (binding: unknown, prefixes: Prefixes) => string;
  /**
   * A response of a sparql query as string. If the parameter is provided, the result will be visualized in YASR.
   */
  private sparqlResponse: string | undefined;

  constructor() {
    this.render = RenderingMode.YASGUI;
    this.orientation = YasguiOrientation.VERTICAL;
    this.showEditorTabs = true;
    this.showResultTabs = true;
    this.showResultInfo = true;
    this.showToolbar = true;
    this.showControlBar = true;
    this.showQueryButton = true;
    this.showQueryLoader = true;
    this.endpoint = '';
    this.i18n = undefined;
    this.method = YasguiQueryHttpMethod.GET;
    this.headers = undefined;
    this.infer = true;
    this.immutableInfer = false;
    this.sameAs = true;
    this.immutableSameAs = false;
    this.clearState = false;
    this.copyEndpointOnNewTab = true;
    this.componentId = undefined;
    this.yasqeMode = YasqeMode.WRITE;
    this.query = undefined;
    this.initialQuery = undefined;
    this.defaultTabNameLabelKey = undefined;
    this.yasqeActionButtons = undefined;
    this.createShareableLink = null;
    this.populateFromUrl = false;
    this.prefixes = undefined;
    this.defaultPlugin = YasrPluginName.EXTENDED_TABLE;
    this.pluginOrder = [YasrPluginName.EXTENDED_TABLE, YasrPluginName.RAW_RESPONSE];
    this.pluginsConfigurations = undefined;
    this.pageSize = 1000;
    this.paginationOn = true;
    this.downloadAsOn = true;
    this.maxPersistentResponseSize = 500000;
    this.yasqeAutocomplete = undefined;
    this.isVirtualRepository = false;
    this.beforeUpdateQuery = undefined;
    this.getRepositoryStatementsCount = undefined;
    this.onQueryAborted = undefined;
    this.yasrToolbarPlugins = undefined;
    this.getCellContent = () => '';
    this.sparqlResponse = undefined;
  }
}
