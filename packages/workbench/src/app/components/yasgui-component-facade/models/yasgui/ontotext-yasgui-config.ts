import {RenderingMode} from './rendering-mode';
import {YasguiOrientation} from './yasgui-orientation';
import {YasguiQueryHttpMethod} from './yasgui-query-http-method';
import {YasqeMode} from '../yasqe/yasqe-mode';
import {YasqeActionButtonDefinition} from '../yasqe/yasqe-action-button-definition';
import {YasrPluginName} from '../yasr/yasr-plugin-name';
import {YasrToolbarPlugin} from '../yasr/yasr-toolbar-plugin';
import {Prefixes} from '../../../../models/prefixes';
import {TranslationBundles} from '../../../../models/translation-bundles';
import {OutputHandlers} from '../output-handlers';
import {Yasgui} from './yasgui';
import {BeforeUpdateQueryResult, HttpHeaders} from '@ontotext/workbench-api';
import {PluginConfigurations} from '../yasr/geo-plugin/plugin-configurations';
import {YasrFullscreenConfig} from '../yasr/yasr-fullscreen-config';

/**
 * Holds all configurations related with ontotext-yasgui-web-component.
 */
export class OntotextYasguiConfig {
  /**
   * Configure what part of the yasgui should be rendered.
   * The value have to be one of the {@link RenderingMode} options.
   */
  public render: RenderingMode;
  /**
   * Configure the yasgui layout orientation.
   * The value have to be one of the {@link YasguiOrientation} options.
   */
  public orientation: YasguiOrientation;
  /**
   * If the yasgui tabs should be rendered or not.
   */
  public showEditorTabs: boolean;
  /**
   * If the yasr tabs should be rendered or not.
   */
  public showResultTabs: boolean;
  /**
   * If the result information header of YASR should be rendered or not.
   */
  public showResultInfo: boolean;
  /**
   * If the toolbar with render mode buttons should be rendered or not.
   */
  public showToolbar: boolean;
  /**
   * If the control bar should be rendered or not.
   */
  public showControlBar: boolean;
  /**
   * If "Run" button should be rendered or not. Default is true.
   */
  public showQueryButton: boolean;
  /**
   * Flag that controls displaying the loader during the run query process.
   */
  public showQueryLoader: boolean;
  /**
   * The sparql endpoint which will be used when a query request is made.
   * It is important to note that if the endpoint configuration is passed as string, it will be persisted when first
   * time initializes the instance with specific {@link OntotextYasguiConfig#componentId}. Subsequent query executions
   * will use the endpoint stored in the persistence regardless if the configuration is changed.
   * If the endpoint is defined as a function, it will be called before each query execution.
   */
  public endpoint: string | ((yasgui: Yasgui) => string);
  /**
   * Key -> value translations as JSON. If the language is supported, then not needed to pass all label values.
   * If pass a new language then all label's values have to be present, otherwise they will be translated to the default
   * English language.
   */
  public i18n: TranslationBundles | undefined;
  /**
   * The request type.
   * The value have to be one of the {@link YasguiQueryHttpMethod} options.
   */
  public method: YasguiQueryHttpMethod;
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
  public headers: HttpHeaders | ((yasgui: Yasgui) => HttpHeaders | undefined) | undefined;
  /**
   * The value of "infer" parameter when a query is executed.
   * Default value is true.
   */
  public infer: boolean | undefined;
  /**
   * If set to true, the 'infer' value cannot be changed.
   * Default value is false.
   */
  public immutableInfer: boolean | undefined;
  /**
   * The value of "sameAs" parameter when a query is executed.
   * Default value is true.
   */
  public sameAs: boolean | undefined;
  /**
   * If set to true, the 'sameAs' value cannot be changed.
   * Default value is false.
   */
  public immutableSameAs: boolean | undefined;
  /**
   * If the Yasgui state should be cleared to the initial state.
   * Default value is false.
   */
  public clearState: boolean;
  /**
   * If the configured endpoint should be preconfigured to any new opened editor tab.
   */
  public copyEndpointOnNewTab: boolean;
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
  public componentId: string | undefined;
  /**
   * The value have to be one of the {@link YasqeMode} options.
   */
  public yasqeMode: YasqeMode;
  /**
   * Default query when a tab is opened.
   */
  public query: string | undefined;
  /**
   * Initial query when yasgui is rendered if not set the default query will be set.
   */
  public initialQuery: string | undefined;
  /**
   * The translation label key that should be used to fetch the default tab name when a new tab is created.
   */
  public defaultTabNameLabelKey: string | undefined;
  /**
   * Action button definitions which can be plugged in the yasqe extension point.
   */
  public yasqeActionButtons: YasqeActionButtonDefinition[] | undefined;
  /**
   * Function which is used by yasgui internally to create a shareable links. We
   * expose it here just to allow the share button to be hidden but in reality it
   * doesn't work due to a bug in the yasgui configuration merge code.
   */
  public createShareableLink: ((yasqe: unknown) => string | null) | null;
  /**
   * This allows to skip the code in yasgui handling url parameters and internally
   * initializing the editor using them.
   */
  public populateFromUrl: boolean;
  /**
   * Object with uris and their corresponding prefixes.
   */
  public prefixes: Prefixes | undefined;
  /**
   * The name of plugin which have to be active when yasr is created.
   * The value have to be one of the {@link YasrPluginName} options.
   */
  public defaultPlugin: YasrPluginName;
  /**
   * Describes the order of how plugins will be displayed.
   * The values of the array have to be {@link YasrPluginName} options.
   * For example: ["extended_table", "response"]
   */
  public pluginOrder: YasrPluginName[];
  /**
   * An object containing the configuration for each plugin.
   */
  public pluginsConfigurations?: PluginConfigurations;
  /**
   * Defines pageSize of pagination.
   * Default value is 1000.
   */
  public pageSize: number;
  /**
   * Flag that controls usage of pagination. When it is true then pagination will be used.
   */
  public paginationOn: boolean;
  /**
   * A flag that controls creation of "Download as" dropdown. When false, the dropdown will not be created.
   * Default value is true.
   */
  public downloadAsOn: boolean;
  /**
   * Maximum length of response which will be persisted. If response is bigger it will not be persisted in browser
   * local store.
   * Default value is 500000.
   */
  public maxPersistentResponseSize: number;
  /**
   * Registered yasqe autocomplete handlers. Every handler is mapped by its name.
   */
  public yasqeAutocomplete: Record<string, unknown> | undefined;
  /**
   * Flag that controls update operations. If this flag is set to true, then all update operations will be disabled.
   * For virtual repositories only select queries are allowed.
   * Default value is false.
   */
  public isVirtualRepository: boolean;
  /**
   * This function will be called before the update query is executed. The client can abort execution of query for some
   * reason and can provide a message or label key for the abort reason.
   */
  public beforeUpdateQuery: ((query: string, tabId: string) => Promise<void | BeforeUpdateQueryResult>) | undefined;
  /**
   * This function will be called before and after execution of an update query. Depends on results a corresponding
   * result message info will be generated.
   */
  public getRepositoryStatementsCount: (() => Promise<number>) | undefined;
  /**
   * If this function is present, then an "Abort query" button will be displayed when a query is running. If the  button
   * is clicked then this function will be invoked after the abort operation was triggered. The button will be visible
   * until "ontotext-yasgui-web-component" client resolves the returned promise.
   */
  public onQueryAborted: ((req: unknown) => Promise<void>) | undefined;
  /**
   * All passed plugins will be displayed on the right of the ontotext-yasgui-web-component toolbar.
   */
  public yasrToolbarPlugins: YasrToolbarPlugin[] | undefined;
  /**
   * If this function is present, then it will be called on every one result cell.
   * @param binding - {Parser.BindingValue} binding value that will be shown into a cell.
   * @param prefixes - Object with uris and their corresponding prefixes.
   *
   * @returns - html that will display in the cell.
   */
  public getCellContent: ((binding: unknown, prefixes: Prefixes) => string) | undefined;
  /**
   * A response of a sparql query as string. If the parameter is provided, the result will be visualized in YASR.
   */
  public sparqlResponse: string | undefined;
  /**
   * A map of output handlers which can be used to handle different types of SPARQL results.
   */
  outputHandlers: OutputHandlers | undefined;
  /**
   * The plugin name to be selected for the active YASR instance. If not set, the persisted selection or the default plugin will be used.
   */
  public selectedPlugin?: string;
  /**
   * Configuration options for controlling YASR fullscreen behavior.
   */
  public yasrFullscreen: YasrFullscreenConfig;

  constructor() {
    this.render = RenderingMode.YASGUI;
    this.orientation = YasguiOrientation.VERTICAL;
    this.showEditorTabs = true;
    this.showResultTabs = true;
    this.showResultInfo = true;
    this.showToolbar = true;
    this.showControlBar = false;
    this.showQueryButton = true;
    this.showQueryLoader = true;
    this.endpoint = '';
    this.i18n = undefined;
    this.method = YasguiQueryHttpMethod.GET;
    this.headers = undefined;
    this.infer = undefined;
    this.immutableInfer = undefined;
    this.sameAs = undefined;
    this.immutableSameAs = undefined;
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
    this.getCellContent = undefined;
    this.sparqlResponse = undefined;
    this.outputHandlers = undefined;
    this.selectedPlugin = undefined;
    this.yasrFullscreen = new YasrFullscreenConfig();
  }
}
