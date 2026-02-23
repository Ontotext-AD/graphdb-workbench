export class PlaygroundEditorSteps {

    static getResponse() {
        return cy.get('.graphiql-response');
    }

    static getResponseCodeMirror() {
        return PlaygroundEditorSteps.getResponse().find('.CodeMirror');
    }

    static getGraphiqlEditors() {
        return cy.get('.graphiql-editors');
    }

    static getGraphiqlEditorsCodeMirror() {
        return PlaygroundEditorSteps.getGraphiqlEditors().find('.CodeMirror');
    }

    static getGraphiqlEditorTools() {
        return cy.get('.graphiql-editor-tools');
    }

    static getGraphiqlEditorTool() {
        return cy.get('.graphiql-editor-tool');
    }

    static getVariablesBtn() {
        return PlaygroundEditorSteps.getGraphiqlEditorTools().find('button[data-name="variables"]');
    }

    static openVariables() {
        PlaygroundEditorSteps.getVariablesBtn().click();
    }

    static getHeadersBtn() {
        return PlaygroundEditorSteps.getGraphiqlEditorTools().find('button[data-name="headers"]');
    }

    static openHeaders() {
        PlaygroundEditorSteps.getHeadersBtn().click();
    }

    static getActiveGraphiqlEditorToolCodeMirror() {
        return PlaygroundEditorSteps.getGraphiqlEditorTool().find('.graphiql-editor:not(.hidden) .CodeMirror');
    }
}
