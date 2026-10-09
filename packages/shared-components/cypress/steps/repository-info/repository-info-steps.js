import {BaseSteps} from '../base-steps';

export class RepositoryInfoSteps extends BaseSteps {
  static visit() {
    super.visit('repository-info');
  }

  static getRepositoryInfo(testId) {
    return this.getByTestId(testId);
  }

  static getPart(testId, name) {
    return this.getRepositoryInfo(testId).getByTestId(`repository-info-${name}`);
  }

  static getStateIcon(testId) {
    return this.getPart(testId, 'title').find('i');
  }
}
