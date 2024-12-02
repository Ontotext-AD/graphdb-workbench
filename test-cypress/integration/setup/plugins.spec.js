import {PluginsSteps} from "../../steps/setup/plugins-steps";
import {PluginsStubs} from "../../stubs/setup/plugins-stubs";
import {LicenseStubs} from "../../stubs/license-stubs";

describe('Plugins view', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'plugin-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.initializeRepository(repositoryId);
        LicenseStubs.spyGetLicense();
        PluginsStubs.spyPluginsGet(repositoryId);
        PluginsSteps.visit();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should allow to enable and disable the plugins', () => {
        cy.wait('@get-license');
        cy.wait('@get-plugins');
        PluginsSteps.waitUntilPluginsPageIsLoaded();

        // Verify initial status is ON
        PluginsSteps.getPluginByName('history').should('be.visible');
        PluginsSteps.getPluginStatus('history').contains('ON');
        PluginsSteps.getPluginSwitchField('history').should('be.checked');
        PluginsSteps.togglePlugin('history');

        cy.reload();
        cy.wait('@get-plugins');
        PluginsSteps.waitUntilPluginsPageIsLoaded();
        PluginsSteps.getPluginsView().should('be.visible');
        PluginsSteps.getPluginByName('history').should('be.visible');
        PluginsSteps.getPluginSwitchField('history').should('not.be.checked');
    });
});
