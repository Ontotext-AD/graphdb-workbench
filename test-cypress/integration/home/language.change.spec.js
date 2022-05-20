import HomeSteps from '../../steps/home-steps';
import SparqlSteps from '../../steps/sparql-steps';

describe('Home screen language validation', () => {
    let repositoryId;

    beforeEach(() => {
        cy.viewport(1280, 1000);
        HomeSteps.visitAndWaitLoader();
        repositoryId = '23repo' + Date.now();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
        // Change the language back to English
        SparqlSteps.changeLanguage('Anglais');
    });

    context('Language change label checks', () => {
        it('Default language should be active and language change should affect labels', () => {
            cy.createRepository({id: repositoryId});
            cy.initializeRepository(repositoryId);
            cy.enableAutocomplete(repositoryId);
            cy.presetRepository(repositoryId);

            // When I visit home page with selected repository
            HomeSteps.visitAndWaitLoader();
            // Check some labels are in default language
            cy.contains('View resource');
            cy.contains('Active repository');
            cy.contains('Saved SPARQL queries');
            cy.contains('License');
            SparqlSteps.changeLanguage('French');

            // The text in the labels should change
            cy.contains('Voir la ressource');
            cy.contains('Répertoire actif');
            cy.contains('Requêtes SPARQL sauvegardées');
            cy.contains('Licence');

            cy.deleteRepository(repositoryId);
        });
    });
})
