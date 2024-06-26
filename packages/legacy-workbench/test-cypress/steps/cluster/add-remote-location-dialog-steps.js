import {ModalDialogSteps} from "../modal-dialog-steps";

export class AddRemoteLocationDialogSteps extends ModalDialogSteps {
    static typeLocation(location) {
        this.getDialog().find('#sesameLocation').type(location);
    }

    static addLocation() {
        this.getDialogFooter().find('.add-location-btn').click();
    }
}
