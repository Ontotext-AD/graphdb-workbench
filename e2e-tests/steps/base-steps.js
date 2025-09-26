export class BaseSteps {
  static visit(page) {
    cy.visit(page);
  }

  static clickOutsideElement() {
    cy.get('body').click(0,0);
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

  static getUrl() {
    return cy.url();
  }
}
