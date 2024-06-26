export class PluginsSteps {
    static visit() {
        cy.visit('/plugins');
    }

    static getPluginsView() {
        return cy.get('#plugins');
    }

    static waitUntilPluginsPageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        // No active loader
        cy.get('.ot-loader').should('not.exist');
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
