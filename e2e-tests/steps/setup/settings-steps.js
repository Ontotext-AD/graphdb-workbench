import {EnvironmentStubs} from "../../stubs/environment-stubs";

export class SettingsSteps {
    static visit() {
        cy.visit('/settings');
    }

    static visitInProdMode() {
        cy.visit('/settings', {
            onBeforeLoad: (win) => {
                EnvironmentStubs.stubWbProdMode();
            }
        });
    }

    static visitInDevMode() {
        cy.visit('/settings', {
            onBeforeLoad: (win) => {
                EnvironmentStubs.stubWbDevMode();
            }
        });
    }

    static getSettingsPage() {
        return cy.get('#wb-user');
    }

    static getLoginPanel() {
        return this.getSettingsPage().find('.login-credentials')
    }

    static getPasswordField() {
        return this.getLoginPanel().find('#wb-user-password:password');
    }

    static getConfirmPasswordField() {
        return this.getLoginPanel().find('#wb-user-confirmpassword:password');
    }

    static getSparqlEditorPanel() {
        return this.getSettingsPage()
            .find('.sparql-editor-settings');
    }

    static getSameAsLabel() {
        return this.getSparqlEditorPanel().find('.sameas-label')
    }

    static getSameAsToggle() {
        return this.getSparqlEditorPanel()
            .find('#sameas-on')
            .find('.switch:checkbox');
    }

    static getInferenceToggle() {
        return this.getSparqlEditorPanel()
            .find('#inference-on')
            .find('.switch:checkbox');
    }

    static getInferenceLabel() {
        return this.getSparqlEditorPanel().find('.inference-label');
    }

    static getCountCheckbox() {
        return this.getSparqlEditorPanel().find('#defaultCount:checkbox');
    }

    static getIgnoreSharedCheckbox() {
        return this.getSparqlEditorPanel().find('#ignore-shared:checkbox');
    }

    static getUserRolePanel() {
        return this.getSettingsPage().find('.user-role');
    }

    static getUserRoleRadioButton() {
        return this.getUserRolePanel().find('#roleAdmin:radio');
    }

    static getRepoManagerRadioButton() {
        return this.getUserRolePanel().find('#roleRepoAdmin:radio');
    }

    static getAdminRadioButton() {
        return this.getUserRolePanel().find('#roleUser:radio');
    }

    static getCookiePolicyButton() {
        return this.getSettingsPage().find('.show-cookie-policy-btn');
    }

    static getUserRepositoryTable() {
        return this.getSettingsPage().find('.user-repositories .table');
    }

    static getUserRepository(name) {
        return this.getUserRepositoryTable().find(`.repository-name:contains('${name}')`).closest('tr');
    }

    static getReadRightsCheckbox(repositoryId) {
        return this.getUserRepository(repositoryId).find('.read-rights .read:checkbox');
    }

    static getWriteRightsCheckbox(repositoryId) {
        return this.getUserRepository(repositoryId).find('.write-rights .write:checkbox');
    }

    static clickCookiePolicyLink() {
        return SettingsSteps.getCookiePolicyButton().click();
    }

    static getCookiePolicyModal() {
        return cy.get('.cookie-policy-modal');
    }
}
