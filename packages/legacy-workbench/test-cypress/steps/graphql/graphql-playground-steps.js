const VIEW_URL = '/graphql/playground';

export class GraphqlPlaygroundSteps {

    static visit() {
        return cy.visit(VIEW_URL);
    }

    static getView() {
        return cy.get('.graphql-playground-view');
    }

    static getNoSchemasAlert() {
        return this.getView().find('.no-endpoints-view');
    }

    static getPlayground() {
        return this.getView().find('.graphiql-query-editor textarea');
    }

    static getEndpointsSelectMenu() {
        return this.getView().find('.graphql-endpoint-selector');
    }

    static getEndpointsSelectMenuOptions() {
        return this.getEndpointsSelectMenu().find('option');
    }

    static getSelectedEndpoint() {
        return this.getEndpointsSelectMenu().find('option:selected');
    }

    static selectEndpoint(endpoint) {
        return this.getEndpointsSelectMenu().select(endpoint);
    }

    static getQueryEditor() {
        return this.getView().find('.graphiql-query-editor textarea');
    }

    static setInEditor(text) {
        return cy.window()
            .then((win) => {
                // @ts-ignore CodeMirror is undefined
                const codeMirrorInstance = win.document.querySelector('.CodeMirror').CodeMirror;
                codeMirrorInstance.setValue(text);
            });
    }

    static clear() {
        this.setInEditor('');
    }

    static getEditorContent() {
        return cy.window().then((win) => {
            // @ts-ignore CodeMirror is undefined
            const codeMirrorInstance = win.document.querySelector('.CodeMirror').CodeMirror;
            return codeMirrorInstance.getValue();
        });
    }

    static getExecuteButton() {
        return this.getView().find('.graphiql-execute-button');
    }

    static executeQuery(delay = 150) {
        cy.wait(delay);
        return this.getExecuteButton().click();
    }

    static getResponse() {
        return this.getView().find('.graphiql-response');
    }

    static getAddTabButton() {
        return cy.get('.graphiql-tab-add');
    }

    static addTab() {
        this.getAddTabButton().click();
    }

    static getTabsContainer() {
        return cy.get('.graphiql-tabs');
    }

    static getTabs() {
        return this.getTabsContainer().find('.graphiql-tab');
    }
}
