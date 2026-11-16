import {BaseSteps} from './base-steps';

export class OntoToastrSteps extends BaseSteps {
    static getToastrContainer() {
        return this.getByTestId('onto-toastr');
    }

    static getSuccessToast() {
        return this.getToast('success');
    }

    static getErrorToast() {
        return this.getToast('error');
    }

    static getToast(type) {
        return this.getToastrContainer().find(this.buildTestIdAttr(`onto-toastr-toast-${type}`));
    }
}
