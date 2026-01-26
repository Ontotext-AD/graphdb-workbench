import {BaseSteps} from '../base-steps';

export class LoaderSteps extends BaseSteps {
  static visit() {
    super.visit('onto-loader');
  }

  static getLoader(testId) {
    return this.getByTestId(testId);
  }

  static getSpinner(testId) {
    return this.getLoader(testId).shadow().find('.loader-spinner');
  }

  static getMessage(testId) {
    return this.getLoader(testId).shadow().find('.loader-message');
  }

  static assertLoaderSize(testId, sizePx) {
    this.getSpinner(testId)
      .should('have.css', 'width', `${sizePx}px`)
      .and('have.css', 'height', `${sizePx}px`);
  };

  static assertMessageSize(testId, sizePx) {
    this.getMessage(testId)
      .should('have.css', 'font-size', `${sizePx / 4}px`);
  };
}
