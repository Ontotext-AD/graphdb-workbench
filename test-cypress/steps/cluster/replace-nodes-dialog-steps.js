import {ModalDialogSteps} from "../modal-dialog-steps";

export class ReplaceNodesDialogSteps extends ModalDialogSteps {
    static getReplaceClusterDialog() {
        return this.getDialog().find('.replace-cluster-nodes-dialog');
    }

    static getClusterNodes() {
        return this.getDialogBody().find('.nodes-list .list-group-item-node');
    }

    static selectClusterNode(index) {
        this.getClusterNodes().eq(index).click();
    }

    static getRemoteLocations() {
        return this.getDialogBody().find('.locations-list .location-item');
    }

    static getReplaceNodesButton() {
        return this.getDialogFooter().find('#wb-replace-nodes-in-cluster-submit');
    }

    static replaceNodes() {
        this.getReplaceNodesButton().click();
    }

    static getRemoteLocationsList() {
        return this.getReplaceClusterDialog().find('.remote-locations .location-item');
    }

    static selectRemoteLocation(index) {
        this.getRemoteLocationsList().eq(index).click();
    }

    static getSelectedRemoteLocations() {
        return this.getReplaceClusterDialog().find('.selected-remote-locations .list-group-item-node');
    }
}
