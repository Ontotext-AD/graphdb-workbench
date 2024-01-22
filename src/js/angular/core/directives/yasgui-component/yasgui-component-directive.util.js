/**
 * Defines the colors in which the tab name has to be changed.
 * @type {string[]} - Array of valid CSS values for the color property.
 */
const HIGHLIGHT_TAB_NAME_COLORS = ['var(--primary-color)', '', 'var(--primary-color)'];
/**
 * Defines the time when the tab name color has to change.
 *
 * @type {number} - Time in milliseconds.
 */
const COLOR_CHANGES_INTERVAL = 400;

export const YasguiComponentDirectiveUtil = (function () {

    const getOntotextYasguiElementController = (directiveSelector) => {
        const elementById = angular.element(document.querySelector(directiveSelector));
        const directiveElement = angular.element(elementById);
        return directiveElement.isolateScope();
    };

    /**
     * Fetches yasgui component.
     *
     * @param {string} directiveSelector - the unique selector of the yasgui component directive.
     *
     * @return {YasguiComponent}
     */
    const getOntotextYasguiElement = (directiveSelector) => {
        return YasguiComponentDirectiveUtil.getOntotextYasguiElementController(directiveSelector).getOntotextYasguiElement();
    };

    /**
     * Fetches yasgui component.
     *
     * @param {string} directiveSelector - the unique selector of the yasgui component directive.
     *
     * @param {number} timeoutInSeconds - how many times to looking for the directive.
     * @return {Promise<YasguiComponent>}
     */
    const getOntotextYasguiElementAsync = (directiveSelector, timeoutInSeconds = 1) => {
        return new Promise((resolve, reject) => {
            let directive = getOntotextYasguiElementController(directiveSelector);
            if (directive) {
                resolve(directive.getOntotextYasguiElement());
            }
            let iteration = timeoutInSeconds * 1000 | 1000;
            const waitTime = 100;
            const interval = setInterval(() => {
                directive = getOntotextYasguiElementController(directiveSelector);
                if (directive) {
                    clearInterval(interval);
                    resolve(directive.getOntotextYasguiElement());
                } else {
                    iteration -= waitTime;
                    if (iteration < 0) {
                        clearInterval(interval);
                        console.log('YASGUI component is not found', directiveSelector);
                        reject(new Error('Element is not found: ' + directiveSelector));
                    }
                }
            }, waitTime);
        });
    };

    /**
     * Executes a <code>query</code>
     * @param {string} directiveSelector
     * @param {string} query
     * @return {Promise<YasguiComponent>}
     */
    const executeSparqlQuery = (directiveSelector, query) => {
        let yasguiComponent = undefined;
        return setQuery(directiveSelector, query)
            .then((yasgui) => {
                yasguiComponent = yasgui;
                return yasgui;
            })
            .then(() => yasguiComponent.query())
            .then(() => yasguiComponent);
    };

    /**
     * Set the <code>query</code> to editor.
     * @param {string} directiveSelector
     * @param {string} query
     * @return {Promise<YasguiComponent>}
     */
    const setQuery = (directiveSelector, query) => {
        let yasguiComponent = undefined;
        return getOntotextYasguiElementAsync(directiveSelector)
            .then((yasgui) => {
                yasguiComponent = yasgui;
                return yasgui;
            })
            .then(() => yasguiComponent.setQuery(query))
            .then(() => yasguiComponent);
    };

    /**
     * Makes the <code>tab</code> name to blinks for a while. The color of the name is changes every 400 milliseconds.
     * The colors are defined in <code>HIGHLIGHT_TAB_NAME_COLORS</code>;
     *
     * @param {Tab} tab - the tab which name have to be highlighted.
     */
    const highlightTabName = (tab) => {
        const tabElement = getTabElement(tab);
        if (!tabElement) {
            return;
        }

        let index = 0;
        let interval = undefined;

        const highlightFun = () => {
            tabElement.style.color = HIGHLIGHT_TAB_NAME_COLORS[index++];
            if (index > HIGHLIGHT_TAB_NAME_COLORS.length) {
                tabElement.style.color = '';
                clearInterval(interval);
            }
        };

        interval = setInterval(highlightFun, COLOR_CHANGES_INTERVAL);
        highlightFun();
    };

    // =========================
    // Private function
    // =========================
    const getTabElement = (tab) => {
        if (!tab || !tab.yasgui || !tab.yasgui.tabElements) {
            return;
        }
        const tabElements = tab.yasgui.tabElements;
        const tabElement = tabElements.get(tab.getId());

        if (tabElement) {
            return tabElement.tabEl;
        }
    };

    return {
        getOntotextYasguiElementController,
        getOntotextYasguiElement,
        getOntotextYasguiElementAsync,
        executeSparqlQuery,
        setQuery,
        highlightTabName
    };
})();

export class YasqeButtonsBuilder {

    constructor() {
        this.createSavedQueryVisibility = false;
        this.showSavedQueriesVisibility = false;
        this.shareQueryVisibility = false;
        this.includeInferredStatementsVisibility = false;
    }

    addCreateSavedQuery() {
        this.createSavedQueryVisibility = true;
        return this;
    }

    addShowSavedQueries() {
        this.showSavedQueriesVisibility = true;
        return this;
    }

    addShareQuery() {
        this.shareQueryVisibility = true;
        return this;
    }

    addIncludeInferredStatements() {
        this.includeInferredStatementsVisibility = true;
        return this;
    }

    /**
     *
     * @return {YasqeActionButtonDefinition[]}
     */
    build() {
        return [
            {
                name: YasqeButtonName.CREATE_SAVED_QUERY,
                visible: this.createSavedQueryVisibility
            }, {
                name: YasqeButtonName.SHOW_SAVED_QUERIES,
                visible: this.showSavedQueriesVisibility
            }, {
                name: YasqeButtonName.SHARE_QUERY,
                visible: this.shareQueryVisibility
            }, {
                name: YasqeButtonName.INCLUDE_INFERRED_STATEMENTS,
                visible: this.includeInferredStatementsVisibility
            }
        ];
    }
}

export const YasqeButtonName = {
    CREATE_SAVED_QUERY: 'createSavedQuery',
    SHOW_SAVED_QUERIES: 'showSavedQueries',
    SHARE_QUERY: 'shareQuery',
    EXPANDS_RESULTS: 'expandResults',
    INFER_STATEMENTS: 'inferStatements',
    INCLUDE_INFERRED_STATEMENTS: 'includeInferredStatements'
};

export const DISABLE_YASQE_BUTTONS_CONFIGURATION = new YasqeButtonsBuilder().build();
export const INFERRED_AND_SAME_AS_BUTTONS_CONFIGURATION = new YasqeButtonsBuilder().addIncludeInferredStatements().build();
