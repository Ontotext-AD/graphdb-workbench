export class GraphiQLEditorToolsSteps {
  
  static getGraphiQLEditorTools() {
    return cy.get(".graphiql-editor-tools");
  }
  
  static getGraphiQLEditorTabButton(index) {
    return GraphiQLEditorToolsSteps.getGraphiQLEditorTools().find('button').eq(index);
  }
}
