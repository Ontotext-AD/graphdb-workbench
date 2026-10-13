export class BaseSteps {
  static visit(page) {
    cy.visit(`/pages/${page}/index.html`);
  }

  static clickOutsideElement() {
    cy.get('body').click(0,0);
  }

  static getRedirectUrl() {
    return cy.get('.redirect-url');
  }

  static verifyRedirectUrl(path) {
    const origin = Cypress.config('baseUrl').replace(/\/$/, '');
    cy.document().then((document) => {
      const basePath = document.querySelector('base')?.getAttribute('href') ?? '/';
      this.getRedirectUrl().should('have.text', `redirect to ${origin}${basePath}${path}`);
    });
  }

  static reloadPage(force = false) {
    cy.reload(force);
  }

  static getByTestId(testId) {
    return cy.getByTestId(testId);
  }

  static typeEscapeKey() {
    cy.get('body').type('{esc}');
  }
}
