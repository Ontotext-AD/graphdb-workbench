import {YasguiComponentDirectiveUtil} from "../core/directives/yasgui-component/yasgui-component-directive.util";
import {RenderingMode} from "./ontotext-yasgui/rendering-mode";

export class YasguiComponent {

    constructor(yasguiComponent = YasguiComponentDirectiveUtil.getOntotextYasguiElement('#query-editor')) {
        this.yasguiComponent = yasguiComponent;
    }

    /**
     * Changes rendering mode of component.
     *
     * @param {string} newRenderMode - then new render mode of component. Value have to be one of {@link RenderingMode};
     *
     * @return {Promise<void>}
     */
    changeRenderMode(newRenderMode) {
        return this.yasguiComponent.changeRenderMode(newRenderMode);
    }

    /**
     * Allows the client to set a query in the current opened tab.
     *
     * @param {string} query The query that should be set in the current focused tab.
     *
     * @return {Promise<void>}
     */
    setQuery(query) {
        return this.yasguiComponent.setQuery(query);
    }

    /**
     * Executes the yasqe query. If
     *
     * @param {RenderingMode} viewModeAfterQuery - Set the view mode of YASGUI after executing the query.
     *
     * @return {Promise<any>}
     */
    query(viewModeAfterQuery) {
        return this.yasguiComponent.query(viewModeAfterQuery);
    }

    /**
     * Fetches the query from YASQE editor.
     *
     * @return {Promise<string>}
     */
    getQuery() {
        return this.yasguiComponent.getQuery();
    }

    /**
     * Checks if query is valid.
     *
     * @return {Promise<boolean>}
     */
    isQueryValid() {
        return this.yasguiComponent.isQueryValid();
    }

    /**
     * Allows the client to init the editor using a query model. When the query and query name are
     * found in any existing opened tab, then it'd be focused. Otherwise, a new tab will be created and
     * initialized using the provided query model.
     * @param {TabQueryModel} queryModel The query model.
     *
     * @return {Promise<void>}
     */
    openTab(queryModel) {
        // While this does the job in this particular method, we definitely need a more general approach
        // for handling the fact that there is a chance for the client to hit the problem where when the
        // OntotextYasgui instance is created and returned the wrapped Yasgui instance might not be yet
        // initialized.
        return this.yasguiComponent.openTab(queryModel);
    }

    /**
     * Utility method allowing the client to get the mode of the query which is written in the current
     * editor tab.
     * The query mode can be either `query` or `update` regarding the query mode. This method just
     * exposes the similar utility method from the yasqe component.
     *
     * @return {Promise<string>} A promise which resolves with a string representing the query mode.
     */
    getQueryMode() {
        return this.yasguiComponent.getQueryMode();
    }

    /**
     * Utility method allowing the client to get the type of the query which is written in the current
     * editor tab.
     * The query mode can be `INSERT`, `LOAD`, `CLEAR`, `DELETE`, etc. This method just exposes the
     * similar utility method from the yasqe component.
     *
     * @return {Promise<string>} A promise which resolves with a string representing the query type.
     */
    getQueryType() {
        return this.yasguiComponent.getQueryType();
    }

    /**
     * Fetches the query result and return it as JSON.
     *
     * @return {Promise<unknown>}
     */
    getEmbeddedResultAsJson() {
        return this.yasguiComponent.getEmbeddedResultAsJson();
    }

    /**
     * Fetches the query result and return it as CSV.
     *
     * @return {Promise<unknown>}
     */
    getEmbeddedResultAsCSV() {
        return this.yasguiComponent.getEmbeddedResultAsCSV();
    }

    /**
     * Hides the YASQE action button with the name <code>yasqeActionButtonNames</code>.
     *
     * @param {string | string[]} yasqeActionButtonNames - the name of the action that needs to be hidden. The name have to be value/values from {@see YasqeButtonName}.
     *
     * @return {Promise<void>}
     */
    hideYasqeActionButton(yasqeActionButtonNames) {
        return this.yasguiComponent.hideYasqeActionButton(yasqeActionButtonNames);
    }

    /**
     * Shows the YASQE action button with the name <code>yasqeActionButtonNames</code>.
     *
     * @param {string | string[]} yasqeActionButtonNames - the name of the action that needs to be displayed. The name have to be value/values from {@see YasqeButtonName}.
     *
     * @return {Promise<void>}
     */
    showYasqeActionButton(yasqeActionButtonNames) {
        return this.yasguiComponent.showYasqeActionButton(yasqeActionButtonNames);
    }

    /**
     * Aborts the running query if any.
     *
     * @return {Promise<void>}
     */
    abortQuery() {
        return this.yasguiComponent.abortQuery();
    }
}
