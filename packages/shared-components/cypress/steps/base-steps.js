export class BaseSteps {
  static visit(page) {
    cy.visit(`/pages/${page}/index.html`);
  }
}
