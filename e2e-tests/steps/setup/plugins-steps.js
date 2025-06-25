import {BaseSteps} from "../base-steps";

export class PluginsSteps extends BaseSteps {
    static visit() {
        cy.visit('/plugins');
    }

    static getPluginsView() {
        return cy.get('#plugins');
    }

    static getSearchPluginBar() {
        return this.getPluginsView().getByTestId('search-plugins-bar');
    }

    static getPluginsList() {
        return this.getPluginsView().getByTestId('plugins-list');
    }

    static waitUntilPluginsPageIsLoaded() {
        // No active loader
        cy.get('.ot-loader').should('not.exist');

        // Repository is active
        cy.get('.repository-errors').should('not.be.visible');

        // No plugins errors
        cy.get('.no-plugins-match-alert').should('not.be.visible');
    }

    static getPluginByName(name) {
        return this.getPluginsView().find('.plugin').contains(name).parent();
    }

    static getPluginStatus(name) {
        return this.getPluginByName(name).find('.tag-primary');
    }

    static getPluginSwitch(name) {
        return this.getPluginByName(name).find('.plugins-switch');
    }

    static getPluginSwitchField(name) {
        return this.getPluginSwitch(name).find('input');
    }

    static togglePlugin(name) {
        this.getPluginSwitch(name).click();
    }
}
