import {PluginsSteps} from "../../steps/setup/plugins-steps";

describe('Plugins view', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'plugin-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.initializeRepository(repositoryId);
        PluginsSteps.visit();
        PluginsSteps.waitUntilPluginsPageIsLoaded();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should allow to enable and disable the plugins', () => {
        // Verify initial status is ON
        PluginsSteps.getPluginByName('history').should('be.visible');
        PluginsSteps.getPluginStatus('history').contains('ON');
        PluginsSteps.getPluginSwitchField('history').should('be.checked');
        PluginsSteps.togglePlugin('history');

        PluginsSteps.visit();

        PluginsSteps.getPluginByName('history').should('be.visible');
        PluginsSteps.getPluginSwitchField('history').should('not.be.checked');
    });
});
