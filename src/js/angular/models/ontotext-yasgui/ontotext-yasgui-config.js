import {RenderingMode} from "./rendering-mode";
import {YasguiOrientation} from "./yasgui-orientation";
import {YasguiQueryHttpMethod} from "./yasgui-query-http-method";
import {YasqeMode} from "./yasqe-mode";
import {YasrPluginName} from "./yasr-plugin-name";

/**
 * Holds all configurations related with ontotext-yasgui-web-component.
 */
export class OntotextYasguiConfig {
    constructor() {

        /**
         * Configure what part of the yasgui should be rendered.
         *
         * @type {string} - the value have to be one of the {@link RenderingMode} options.
         */
        this.render = RenderingMode.YASGUI;


        /**
         * Configure the yasgui layout orientation.
         *
         * @type {string} - the value have to be one of the {@link YasguiOrientation} options.
         */
        this.orientation = YasguiOrientation.VERTICAL;

        /**
         * If the yasgui tabs should be rendered or not.
         *
         * @type {boolean}
         */
        this.showEditorTabs = true;

        /**
         * If the yasr tabs should be rendered or not.
         *
         * @type {boolean}
         */
        this.showResultTabs = true;

        /**
         * If the result information header of YASR should be rendered or not.
         *
         * @type {boolean}
         */
        this.showResultInfo = true;

        /**
         * If the toolbar with render mode buttons should be rendered or not.
         *
         * @type {boolean}
         */
        this.showToolbar = true;

        /**
         * If the control bar should be rendered or not.
         *
         * @type {boolean}
         */
        this.showControlBar = true;

        /**
         * If "Run" button should be rendered or not. Default is true.
         *
         * @type {boolean}
         */
        this.showQueryButton = true;

        /**
         * Flag that controls displaying the loader during the run query process.
         *
         * @type {boolean}
         */
        this.showQueryLoader = true;

        /**
         * The sparql endpoint which will be used when a query request is made.
         * It is important to note that if the endpoint configuration is passed as string, it will be persisted when first time initializes
         * the instance with specific {@link OntotextYasguiConfig#componentId}. Subsequent query executions will
         * use the endpoint stored in the persistence regardless if the configuration is changed.
         * If the endpoint is defined as a function, it will be called before each query execution.
         *
         * @type {string | ((yasgui: Yasgui) => string)}
         */
        this.endpoint = '';

        /**
         * Key -> value translations as JSON. If the language is supported, then not needed to pass all label values.
         * If pass a new language then all label's values have to be present, otherwise they will be translated to the default English language.
         * Example:
         * {
         *   en: {
         *     "yasgui.toolbar.orientation.btn.tooltip.switch_orientation_horizontal": "Switch to horizontal view",
         *     "yasgui.toolbar.orientation.btn.tooltip.switch_orientation_vertical": "Switch to vertical view",
         *     "yasgui.toolbar.mode_yasqe.btn.label": "Editor only",
         *     "yasgui.toolbar.mode_yasgui.btn.label": "Editor and results",
         *     "yasgui.toolbar.mode_yasr.btn.label": "Results only",
         *   }
         *   fr: {
         *     "yasgui.toolbar.orientation.btn.tooltip.switch_orientation_vertical": "Basculer vers verticale voir",
         *     "yasgui.toolbar.mode_yasqe.btn.label": "Éditeur seulement",
         *   }
         * }
         */
        this.i18n = undefined;

        /**
         * The request type.
         *
         * @type {string} - the value have to be one of the {@link YasguiQueryHttpMethod} options.
         */
        this.method = YasguiQueryHttpMethod.GET;

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
        this.headers = undefined;

        /**
         * The value of "infer" parameter when a query is executed. Default value is true.
         *
         * @type {boolean}
         */
        this.infer = undefined;

        /**
         * If set to true, the 'infer' value cannot be changed. Default value is false.
         *
         * @type {boolean}
         */
        this.immutableInfer = undefined;

        /**
         * The value of "sameAs" parameter when a query is executed. Default value is true.
         *
         * @type {boolean}
         */
        this.sameAs = undefined;

        /**
         * If set to true, the 'sameAs' value cannot be changed. Default value is false.
         *
         * @type {boolean}
         */
        this.immutableSameAs = undefined;

        /**
         * If the configured endpoint should be preconfigured to any new opened editor tab.
         *
         * @type {boolean}
         */
        this.copyEndpointOnNewTab = true;

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
         *
         * @type {string}
         */
        this.componentId = undefined;

        /**
         * @type {string} - the value have to be one of the {@link YasqeMode} options.
         */
        this.yasqeMode = YasqeMode.WRITE;

        /**
         * Default query when a tab is opened.
         *
         * @type {string}
         */
        this.query = undefined;

        /**
         * Initial query when yasgui is rendered if not set the default query will be set.
         *
         * @type {string}
         */
        this.initialQuery = undefined;

        /**
         * The translation label key that should be used to fetch the default tab name when a new tab is created.
         *
         * @type {string}
         */
        this.defaultTabNameLabelKey = undefined;

        /**
         * Action button definitions which can be plugged in the yasqe extension point.
         *
         * @type {YasqeActionButtonDefinition[]}
         */
        this.yasqeActionButtons = undefined;

        /**
         * Function which is used by yasgui internally to create a shareable links. We
         * expose it here just to allow the share button to be hidden but in reality it
         * doesn't work due to a bug in the yasgui configuration merge code.
         *
         * @type {(yasqe: Yasqe) => string | null}
         */
        this.createShareableLink = null;

        /**
         * This allows to skip the code in yasgui handling url parameters and internally
         * initializing the editor using them.
         *
         * @type {boolean}
         */
        this.populateFromUrl = false;

        /**
         * Object with uris and their corresponding prefixes.
         *
         * @type {{[prefixLabel: string]: string} }
         * For instance:
         * <pre>
         *   {
         *     "gn": "http://www.geonames.org/ontology#",
         *     "path": "http://www.ontotext.com/path#",
         *     "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
         *     "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
         *     "xsd": "http://www.w3.org/2001/XMLSchema#",
         *   }
         * </pre>
         */
        this.prefixes = undefined;

        /**
         * The name of plugin which have to be active when yasr is created.
         *
         * @type {string} - the value have to be one of the {@link YasrPluginName} options.
         */
        this.defaultPlugin = YasrPluginName.EXTENDED_TABLE;

        /**
         * Describes the order of how plugins will be displayed.
         *
         * @type {string[]} the values of the array have to be {@link YasrPluginName} options.
         * For example: ["extended_table", "response"]
         */
        this.pluginOrder = [YasrPluginName.EXTENDED_TABLE, YasrPluginName.RAW_RESPONSE];

        /**
         * Map with configuration of given plugin. The key of map is the name of a plugin. The value is any object which fields are supported by
         * the plugin configuration.
         *
         * @type {{[pluginName]: any}}
         */
        this.pluginsConfigurations = undefined;

        /**
         * Defines pageSize of pagination. Default value is 10.
         *
         * @type {number}
         */
        this.pageSize = 1000;

        /**
         * Flag that controls usage of pagination. When it is true then pagination will be used.
         *
         * @type {boolean}
         */
        this.paginationOn = true;

        /**
         * A flag that controls creation of "Download as" dropdown. When false, the dropdown will not be created. Default value is true.
         *
         * @type {boolean}
         */
        this.downloadAsOn = true;

        /**
         * Maximum length of response which will be persisted. If response is bigger it will not be persisted in browser local store.
         * Default value is 100000.
         *
         * @type {number}
         */
        this.maxPersistentResponseSize = 500000;

        /**
         * Registered yasqe autocomplete handlers. Every handler is mapped by its name.
         */
        this.yasqeAutocomplete = undefined;

        /**
         * Flag that controls update operations. If this flag is set to true, then all update operations will be disabled.
         * For virtual repositories only select queries are allowed.
         *
         * @type {boolean}
         */
        this.isVirtualRepository = undefined;

        /**
         * This function will be called before the update query be executed. The client can abort execution of query for some reason and can
         * provide a message or label key for the reason of aborting.
         *
         * @type {(query: string, tabId: string) => Promise <BeforeUpdateQueryResult> | undefined}
         */
        this.beforeUpdateQuery = undefined;

        /**
         * This function will be called before and after execution of an update query. Depends on results a corresponding result message info will be generated.
         *
         * @type {() => Promise <number>}
         */
        this.getRepositoryStatementsCount = undefined;

        /**
         * If this function is present, then an "Abort query" button wil be displayed when a query is running. If the  button is clicked then
         * this function will be invoked after the abort operation was triggered. The button will be visible until "ontotext-yasgui-web-component" client resolve returned promise.
         *
         * @type {(req) => Promise <void>}
         */
        this.onQueryAborted = undefined;

        /**
         * All passed plugins will be displayed on the right of the ontotext-yasgui-web-component toolbar.
         *
         * @type {YasrToolbarPlugin[]}
         */
        this.yasrToolbarPlugins = undefined;

        /**
         * If this function is present, then it will be called on every one result cell.
         * @param {Parser.BindingValue} binding - binding value that will be shown into a cell.
         * @param {Prefixes} prefixes - Object with uris and their corresponding prefixes.
         *
         * @return {string} - html that will display in the cell.
         */
        this.getCellContent = (binding, prefixes) => '';

        /**
         * A response of a sparql query as string. If the parameter is provided, the result will be visualized in YASR.
         *
         * @type {string | undefined}
         */
        this.sparqlResponse = undefined;
    }
}
