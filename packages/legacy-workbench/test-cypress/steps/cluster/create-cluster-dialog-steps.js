import {ModalDialogSteps} from "../modal-dialog-steps";

export class CreateClusterDialogSteps extends ModalDialogSteps {
    static getCreateClusterDialog() {
        return this.getDialog().find('.create-cluster-dialog');
    }

    static getClusterNodesPanel() {
        return this.getCreateClusterDialog().find('.cluster-nodes');
    }

    static getClusterNodesList() {
        return this.getClusterNodesPanel().find('.nodes-list .list-group-item');
    }

    static getRemoteLocationsList() {
        return this.getCreateClusterDialog().find('.remote-locations .location-item');
    }

    static getSaveClusterConfigButton() {
        return this.getDialogFooter().find('.create-cluster-btn');
    }

    static saveClusterConfig() {
        return this.getSaveClusterConfigButton().click();
    }

    static openAddRemoteLocationDialog() {
        this.getDialog().find('#addLocation').click();
    }

    static selectRemoteLocation(index) {
        this.getRemoteLocationsList().eq(index).click();
    }

    static getNoSelectedNodesWarning() {
        return this.getDialog().find('.no-selected-nodes');
    }
}
