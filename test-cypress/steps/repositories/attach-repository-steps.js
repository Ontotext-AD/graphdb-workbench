export class AttachRepositorySteps {

    static getAttachRemoteLocationBtn() {
        return cy.get('#addAttachRemoteLocation');
    }

    static openAttachRemoteLocationDialog() {
        AttachRepositorySteps.getAttachRemoteLocationBtn().click();
    }

    static getAttachBtn() {
        return cy.get('.attach-location');
    }

    static attachRemoteLocation() {
        AttachRepositorySteps.getAttachBtn().click();
    }

    static getCancelBtn() {
        return cy.get('.cancel-attaching-location');
    }

    static cancelAttaching() {
        AttachRepositorySteps.getCancelBtn().click();
    }

    static saveRemoteLocation() {
        AttachRepositorySteps.getAttachBtn().click();
    }

    static getRemoteLocationDialog() {
        return cy.get('#remoteLocationForm');
    }

    static getAuthenticationRadioBtn() {
        return AttachRepositorySteps.getRemoteLocationDialog().find('.none-authentication');
    }

    static selectAuthenticationRadioBtn() {
        AttachRepositorySteps.getAuthenticationRadioBtn().check();
    }

    static getBasicRadioBtn() {
        return AttachRepositorySteps.getRemoteLocationDialog().find('.basic-authentication');
    }

    static selectBasicRadioBtn() {
        AttachRepositorySteps.getBasicRadioBtn().check();
    }

    static getSignatureRadioBtn() {
        return AttachRepositorySteps.getRemoteLocationDialog().find('.signature-authentication');
    }

    static selectSignatureRadioBtn() {
        AttachRepositorySteps.getSignatureRadioBtn().check();
    }

    static getGraphDBRadioBtn() {
        return AttachRepositorySteps.getRemoteLocationDialog().find('.graph-db-instance');
    }

    static selectGraphDBRadioBtn() {
        AttachRepositorySteps.getGraphDBRadioBtn().check();
    }
    static getOntopicRadioBtn() {
        return AttachRepositorySteps.getRemoteLocationDialog().find('.ontopic-instance');
    }

    static selectOntopicRadioBtn() {
        AttachRepositorySteps.getOntopicRadioBtn().check();
    }

    static getLocationURLInput() {
        return AttachRepositorySteps.getRemoteLocationDialog().get('#location');
    }

    static getUsernameInput() {
        return AttachRepositorySteps.getRemoteLocationDialog().get('#username');
    }

    static getPasswordInput() {
        return AttachRepositorySteps.getRemoteLocationDialog().get('#password');
    }
}
