export class OntoToastrSteps {
    static getToastrContainer() {
        return cy.get('.onto-toastr-container');
    }

    static getSuccessToast() {
        return this.getToastrContainer().find('.toast.success');
    }

    static getErrorToast() {
        return this.getToastrContainer().find('.toast.error');
    }

    static getInfoToast() {
        return this.getToastrContainer().find('.toast.info');
    }

    static getWarningToast() {
        return this.getToastrContainer().find('.toast.warning');
    }
}
