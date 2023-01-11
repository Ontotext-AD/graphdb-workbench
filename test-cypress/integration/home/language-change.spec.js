import HomeSteps from '../../steps/home-steps';
import {LanguageSelectorSteps} from "../../steps/language-selector-steps";

describe('Home screen language validation', () => {
    let repositoryId;

    beforeEach(() => {
        HomeSteps.visitAndWaitLoader();
        repositoryId = '23repo' + Date.now();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);

        // Change the language back to English
        LanguageSelectorSteps.switchToEn();
    });

    context('Language change label checks', () => {
        it('Default language should be active and language change should affect labels', () => {
            cy.createRepository({id: repositoryId});
            cy.initializeRepository(repositoryId);
            cy.enableAutocomplete(repositoryId);
            cy.presetRepository(repositoryId);

            HomeSteps.declineTutorial();

            // When I visit home page with selected repository
            HomeSteps.visitAndWaitLoader();
            // Check some labels are in default language
            HomeSteps.getViewResourceAsLabel().should('have.text', 'View resource');
            HomeSteps.getActiveRepoAsLabel().should('have.text', 'Active repository');
            HomeSteps.getSavedSparqlQueriesAsLabel().should('have.text', 'Saved SPARQL queries');
            HomeSteps.getLicenseAsLabel().should('have.text', 'License');

            LanguageSelectorSteps.switchToFr();

            // The text in the labels should change
            HomeSteps.getViewResourceAsLabel().should('have.text', 'Voir la ressource');
            HomeSteps.getActiveRepoAsLabel().should('have.text', 'Dépôt actif');
            HomeSteps.getSavedSparqlQueriesAsLabel().should('have.text', 'Requêtes SPARQL sauvegardées');
            HomeSteps.getLicenseAsLabel().should('have.text', 'Licence');
        });
    });
})
