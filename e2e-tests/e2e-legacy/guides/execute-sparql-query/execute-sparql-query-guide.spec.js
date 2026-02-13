import {GuideSteps} from '../../../steps/guides/guide-steps.js';
import {GuideDialogSteps} from '../../../steps/guides/guide-dialog-steps.js';
import {MainMenuSteps} from '../../../steps/main-menu-steps.js';
import {GuidesStubs} from '../../../stubs/guides/guides-stubs.js';
import SparqlSteps from '../../../steps/sparql-steps.js';
import {YasqeSteps} from '../../../steps/yasgui/yasqe-steps.js';
import {YasrSteps} from '../../../steps/yasgui/yasr-steps.js';

describe('Execute SPARQL query guide steps', () => {
    let repositoryId;
    const FILE_TO_IMPORT = 'swapi-dataset.ttl';

    beforeEach(() => {
        repositoryId = 'execute-sparql-query-guide-' + Date.now();
        GuidesStubs.stubExecuteSparqlQueryGuide();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);

        GuideSteps.visit();
        GuideSteps.verifyGuidesListExists();
        cy.wait('@getGuides');
        GuideSteps.runFirstGuide();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should execute SPARQL query', () => {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 1/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the SPARQL Query & Update view to execute queries.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 2/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the SPARQL menu.');
        MainMenuSteps.clickOnSparqlMenu();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 3/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Enter the following SPARQL query: ');
        GuideDialogSteps.assertDialogWithContentIsVisible('Extra content for query.');
        GuideDialogSteps.copyQueryToEditor();
        YasqeSteps.verifyQueryTyped("PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n select * where { \n\t?s rdfs:label ?o .\n} limit 3 ")
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 4/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Run button.');
        YasqeSteps.forceExecuteQuery();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 5/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('The table shows the results from executing the query.');
        GuideDialogSteps.assertDialogWithContentIsVisible('Extra content for result.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('SPARQL Query & Update');
        GuideDialogSteps.assertDialogWithContentIsVisible('Some extra explain content');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('SPARQL Query & Update');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the rdf:type IRI to explore it.');
        YasrSteps.clickOnResource(0, 1);
        cy.url().should('include', '/resource?uri=https:%2F%2Fswapi.co%2Fresource%2Fplanet%2F25');
        YasrSteps.getResults().should('have.length', 10);

        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 1/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the SPARQL Query & Update view to execute queries.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 2/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the SPARQL menu.');
        MainMenuSteps.clickOnSparqlMenu();

        GuideDialogSteps.assertDialogWithTitleIsVisible('SPARQL Query & Update — 3/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Enter the following SPARQL query:');
        GuideDialogSteps.assertDialogWithContentIsVisible('The query constructs a graph of films and their characters from the Star Wars API.');
        GuideDialogSteps.copyQueryToEditor();
        YasqeSteps.verifyQueryTyped("PREFIX voc: <https://swapi.co/vocabulary/>\nPREFIX swapi: <https://swapi.co/resource/>\n\nCONSTRUCT {\n?film swapi:hasCharacter ?person .\n}\nWHERE {\n?film a voc:Film ;\nvoc:character ?person .\n}")
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('SPARQL Query & Update — 4/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Run button.');
        YasqeSteps.forceExecuteQuery();

        GuideDialogSteps.assertDialogWithTitleIsVisible('SPARQL Query & Update — 5/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Visual button.');
        SparqlSteps.visualizeConstructQuery();
        cy.url().should('include', '/graphs-visualizations');

        GuideDialogSteps.clickOnCloseButton();
        GuideDialogSteps.assertDialogIsClosed();
    });
});
