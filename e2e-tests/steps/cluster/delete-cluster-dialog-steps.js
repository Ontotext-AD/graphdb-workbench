import {ModalDialogSteps} from "../modal-dialog-steps";

export class DeleteClusterDialogSteps extends ModalDialogSteps {
    static getConfirmButton() {
        return ModalDialogSteps.getDialogFooter().find('#wb-delete-cluster-submit');
    }

    static confirmDeleteCluster() {
        this.getConfirmButton().click();
    }
}
