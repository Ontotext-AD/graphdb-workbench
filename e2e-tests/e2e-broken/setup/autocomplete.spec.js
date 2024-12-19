import {AutocompleteSteps} from "../../steps/setup/autocomplete-steps";
import {LicenseStubs} from "../../stubs/license-stubs";

describe('Autocomplete ', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'autocomplete-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.initializeRepository(repositoryId);
        LicenseStubs.spyGetLicense();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should allow to enable the autocomplete', () => {
        AutocompleteSteps.visit();
        cy.wait('@get-license');
        AutocompleteSteps.waitUntilAutocompletePageIsLoaded();

        // Verify initial status is OFF
        AutocompleteSteps.getAutocompleteHeader()
            .should('be.visible')
            .and('contain', repositoryId);
        AutocompleteSteps.getAutocompleteHeader()
            .find('.tag-default')
            .should('be.visible')
            .and('contain', 'OFF');
        AutocompleteSteps.getAutocompleteSwitch()
            .find('input')
            .should('not.be.checked');
        AutocompleteSteps.getAutocompleteStatus().should('not.be.visible');
        AutocompleteSteps.getBuildButton().should('not.be.visible');

        // Should allow to add autocomplete labels
        AutocompleteSteps.getToggleIRIButton()
            .should('be.visible')
            .and('not.be.disabled');
        AutocompleteSteps.getAddLabelButton()
            .should('be.visible')
            .and('not.be.disabled');

        // Should have default labels
        AutocompleteSteps.getAutocompleteLabels()
            .should('be.visible')
            .find('.wb-autocomplete-labels-row')
            .should('have.length', 1)
            .and('contain', 'http://www.w3.org/2000/01/rdf-schema#label');

        // Enable autocomplete and verify status is OK (possible slow operation)
        AutocompleteSteps.getAutocompleteSwitch().click();
        AutocompleteSteps.getAutocompleteHeader()
            .find('.tag-primary')
            .should('be.visible')
            .and('contain', 'ON');
        AutocompleteSteps.getAutocompleteStatus()
            .should('be.visible')
            .find('.tag-success')
            .should('be.visible')
            .and('contain', 'Ready');
        AutocompleteSteps.getBuildButton()
            .should('be.visible')
            .and('not.be.disabled');
    });
});
