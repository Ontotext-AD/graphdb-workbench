export class BaseSteps {
  static visit(page) {
    cy.visit(`/pages/${page}/index.html`);
  }

  static clickOutsideElement() {
    cy.get('body').click(0,0);
  }

  static getRedirectUrl() {
    return cy.get('#redirect-url');
  }
}
