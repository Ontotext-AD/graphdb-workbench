import {AutocompleteSteps} from "../../../steps/setup/autocomplete-steps";
import {LicenseStubs} from "../../../stubs/license-stubs";

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
        AutocompleteSteps.getAutocompleteLabels().should('be.visible')

        AutocompleteSteps.getLabelRows().should('have.length', 1)
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

    it('should allow add and edit of autocomplete label', () => {
        // Given I'm on the Autocomplete page
        AutocompleteSteps.visit();
        cy.wait('@get-license');
        AutocompleteSteps.waitUntilAutocompletePageIsLoaded();
        // The table should not contain this label
        AutocompleteSteps.getAutocompleteLabels().should('not.contain.text', 'http://xmlns.com/foaf/0.1/name');

        // When I add a label
        AutocompleteSteps.addLabelAndLanguage('http://xmlns.com/foaf/0.1/name', 'fr');
        // Then the list should have my new label
        AutocompleteSteps.getAutocompleteLabels().should('contain.text', 'http://xmlns.com/foaf/0.1/name');

        // When I edit the new label
        AutocompleteSteps.editLabelOnRow(0);
        AutocompleteSteps.typeLabelIri('http://purl.org/dc/elements/1.1/title');
        AutocompleteSteps.saveLabel();
        // Then the list should no longer have the old label
        AutocompleteSteps.getAutocompleteLabels().should('not.contain.text', 'http://xmlns.com/foaf/0.1/name');
        // And instead have the edited label
        AutocompleteSteps.getAutocompleteLabels().should('contain.text', 'http://purl.org/dc/elements/1.1/title');
        AutocompleteSteps.getAutocompleteLabels().should('contain.text', 'fr');
    });
});
