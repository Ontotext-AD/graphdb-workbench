import GuideSteps from "../../steps/guide-steps";

const FILE_FOR_IMPORT = 'starwars.ttl';
const REPOSITORY_ID = 'starwars';
const FILE_FOR_IMPORT_STARWARS_2 = 'starwars-user-interactive.ttl';
const REPOSITORY_ID_STARWARS_2 = 'starwars-user-interactive';

describe('Interactive guides', () => {

    beforeEach(() => {
        cy.intercept('/rest/guides', {fixture: '/guides/guides.json'}).as('getGuides');
    });

    context('Describes "Star wars" interactive guide"', () => {
        it('Describe Star wars interactive guide using "Next" button to the end and "Previous" button to the beginning', () => {
            cy.deleteRepository(REPOSITORY_ID);
            cy.visit('');
            // Start the guide.
            GuideSteps.visitGuidesPage();
            cy.wait(['@getGuides']);

            GuideSteps.runGuide('1 The Star Wars guide');
            GuideSteps.verifyPageNotInteractive();

            // Step Welcome to Star Wars guide
            cy.get('footer button:visible').contains('Next').click();
            GuideSteps.waitDialogWithTitleBeVisible('Welcome to 1 The Star Wars guide — 2/2', 1);
            GuideSteps.verifyPageNotInteractive();

            GuideSteps.clickOnNextButton(1);
            GuideSteps.verifyPageNotInteractive();
            createRepositoryByNextButton(REPOSITORY_ID);

            // Step select "Choose repository" button.
            selectRepositoryByNextButton(REPOSITORY_ID);

            // Step described autocomplete.
            GuideSteps.clickOnNextButton(10);
            GuideSteps.verifyPageNotInteractive();
            enableAutocompleteByNextButton();

            // Step import file intro
            GuideSteps.clickOnNextButton(15);
            GuideSteps.verifyPageNotInteractive();
            importFileByNextButton(FILE_FOR_IMPORT);

            // Step visual graph intro
            GuideSteps.clickOnNextButton(22);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 1/6', 23);

            // Step select menu explore.
            GuideSteps.clickOnNextButton(23);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 2/6', 24);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-explore"]');

            // Step select "Visual graph" menu
            GuideSteps.clickOnNextButton(24);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 3/6', 25);
            GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-visual-graph"]');

            // Step enter search RDF resource criteria.
            GuideSteps.clickOnNextButton(25);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 4/6', 26);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graphVisualisationSearchInputNotConfigured"]');

            // Step click on Luke Skywalker autocomplete.
            GuideSteps.clickOnNextButton(26);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 5/6', 27);
            GuideSteps.verifyIsElementInteractable('[guide-selector="autocomplete-https://swapi.co/resource/human/1"]');
            cy.get('[guide-selector="graphVisualisationSearchInputNotConfigured"] input').should('have.value', 'lu');

            // Step described visual graph of Luke Skywalker.
            GuideSteps.clickOnNextButton(27);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 6/6', 28);

            // Step describe Luke Skywalker node.
            GuideSteps.clickOnNextButton(28);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 29);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/human/1"] circle');

            // Step described that Luke is of type Character.
            GuideSteps.clickOnNextButton(29);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph links', 30);
            GuideSteps.verifyIsElementInteractable('.link-wrapper[id^="https://swapi.co/resource/human/1>https://swapi.co/vocabulary/Character"]');

            // Step described that Luke is of type Mammal.
            GuideSteps.clickOnNextButton(30);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 31);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/vocabulary/Mammal"] circle');

            // Step described that about Luke's vehicle.
            GuideSteps.clickOnNextButton(31);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph links', 32);
            GuideSteps.verifyIsElementInteractable('.link-wrapper[id^="https://swapi.co/resource/human/1>https://swapi.co/resource/vehicle/14"]');

            // Step described another vehicle.
            GuideSteps.clickOnNextButton(32);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 33);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/vehicle/30"] circle');

            // Step described the film "A New Hope"
            GuideSteps.clickOnNextButton(33);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 1/6', 34);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/film/1"] circle');
            //
            // // Step described side info panel.
            GuideSteps.clickOnNextButton(34);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.verifyIsElementInteractable('.rdf-side-panel-content');
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 2/6', 35);

            // Step described property voc:Film.
            GuideSteps.clickOnNextButton(35);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 3/6', 36);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graph-visualization-node-info-types"]');

            // Step described property voc:releaseDate.
            GuideSteps.clickOnNextButton(36);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 4/6', 37);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graph-visualization-node-info-voc:releaseDate"]');

            // Step described property voc:episodeId.
            GuideSteps.clickOnNextButton(37);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 5/6', 38);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graph-visualization-node-info-voc:episodeId"]');

            // Step described close side info panel button.
            GuideSteps.clickOnNextButton(38);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 6/6', 39);
            GuideSteps.verifyIsElementInteractable('[guide-selector="close-info-panel"]');

            // Step described how to expand the visual graph node.
            GuideSteps.clickOnNextButton(39);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph: expand node', 40);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/film/1"] circle');

            // Step described C-3P0.
            GuideSteps.clickOnNextButton(40);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 41);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/droid/2"] circle');

            // Step described planet Tatooine.
            GuideSteps.clickOnNextButton(41);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 42);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/planet/1"] circle');

            // Step described SPARQL Query.
            GuideSteps.clickOnNextButton(42);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 1/11', 43);

            // Step click on menu-sparql button.
            GuideSteps.clickOnNextButton(43);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 2/11', 44);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-sparql"]');

            // Step described a query.
            GuideSteps.clickOnNextButton(44);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 3/11', 45);
            GuideSteps.verifyIsElementInteractable('[guide-selector="queryEditor"] .CodeMirror-code');

            // Step click on button run.
            GuideSteps.clickOnNextButton(45);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 4/11', 46);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            // Step click on button run.
            GuideSteps.clickOnNextButton(46);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 5/11', 47);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');


            // Step described a query.
            GuideSteps.clickOnNextButton(47);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 6/11', 48);
            GuideSteps.verifyIsElementInteractable('[guide-selector="queryEditor"] .CodeMirror-code');

            // Step click on button run.
            GuideSteps.clickOnNextButton(48);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 7/11', 49);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            // Step click on button run.
            GuideSteps.clickOnNextButton(49);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 8/11', 50);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            GuideSteps.clickOnNextButton(50);
            // Step described a query.
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 9/11', 51);
            GuideSteps.verifyIsElementInteractable('[guide-selector="queryEditor"] .CodeMirror-code');

            // Step click on button run.
            GuideSteps.clickOnNextButton(51);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 10/11', 52);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            // Step click on button run.
            GuideSteps.clickOnNextButton(52);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 11/11', 53);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            GuideSteps.clickOnNextButton(53);
            GuideSteps.waitDialogWithTitleBeVisible('End of guide', 54);

            // We are reached the end of the guide, now we will go to the start.
            executePreviousFlowOfStarWarsGuide(REPOSITORY_ID);
            GuideSteps.cancelGuide();
            cy.deleteRepository(REPOSITORY_ID);
        });

        it('Describe Star wars interactive guide using UI interface to the end and "Previous" button to the beginning', () => {
            cy.deleteRepository(REPOSITORY_ID_STARWARS_2);
            cy.visit('');
            // Start the guide.
            GuideSteps.visitGuidesPage();
            cy.wait(['@getGuides']);
            // Start the guide.
            GuideSteps.runGuide('2 The Star Wars guide');
            GuideSteps.verifyPageNotInteractive();

            // Step Welcome to Star Wars guide
            cy.get('footer button:visible').contains('Next').click();
            GuideSteps.waitDialogWithTitleBeVisible('Welcome to 2 The Star Wars guide User Interactive flow — 2/2', 1);
            GuideSteps.verifyPageNotInteractive();

            GuideSteps.clickOnNextButton(1);
            createRepository(REPOSITORY_ID_STARWARS_2);

            // Step select "Choose repository" button.
            selectRepository(REPOSITORY_ID_STARWARS_2);

            // Enable autocomplete steps
            enableAutocomplete();

            // Import rdf file step
            importFile(FILE_FOR_IMPORT_STARWARS_2);

            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 1/6', 23);
            GuideSteps.verifyPageNotInteractive();

            // Step select menu explore.
            GuideSteps.clickOnNextButton(23);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 2/6', 24);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-explore"]');

            // Step select "Visual graph" menu
            GuideSteps.clickOnMenuExploreButton();
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 3/6', 25);
            GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-visual-graph"]');

            // Step enter search RDF resource criteria.
            GuideSteps.clickOnSubMenuVisualGraphButton();
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 4/6', 26);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graphVisualisationSearchInputNotConfigured"]');

            // Step click on Luke Skywalker autocomplete.
            GuideSteps.typetToSearchRdfResources('lu');
            GuideSteps.clickOnNextButton(26);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 5/6', 27);
            GuideSteps.verifyIsElementInteractable('[guide-selector="autocomplete-https://swapi.co/resource/human/1"]');
            cy.get('[guide-selector="graphVisualisationSearchInputNotConfigured"] input').should('have.value', 'lu');

            // Step described visual graph of Luke Skywalker.
            GuideSteps.clickOnNextButton(27);
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 6/6', 28);
            GuideSteps.verifyPageNotInteractive();

            // Step describe Luke Skywalker node.
            GuideSteps.clickOnNextButton(28);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 29);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/human/1"] circle');

            // Step described that Luke is of type Character.
            GuideSteps.clickOnNextButton(29);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph links', 30);
            GuideSteps.verifyIsElementInteractable('.link-wrapper[id^="https://swapi.co/resource/human/1>https://swapi.co/vocabulary/Character"]');

            // Step described that Luke is of type Mammal.
            GuideSteps.clickOnNextButton(30);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 31);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/vocabulary/Mammal"] circle');

            // Step described that about Luke's vehicle.
            GuideSteps.clickOnNextButton(31);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph links', 32);
            GuideSteps.verifyIsElementInteractable('.link-wrapper[id^="https://swapi.co/resource/human/1>https://swapi.co/resource/vehicle/14"]');

            // Step described another vehicle.
            GuideSteps.clickOnNextButton(32);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 33);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/vehicle/30"] circle');

            // Step described the film "A New Hope"
            GuideSteps.clickOnNextButton(33);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 1/6', 34);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/film/1"] circle');

            // Step described side info panel.
            GuideSteps.clickOnVisualGraphNodeButton('https://swapi.co/resource/film/1');
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 2/6', 35);
            GuideSteps.verifyIsElementInteractable('.rdf-side-panel-content');

            // Step described property voc:Film.
            GuideSteps.clickOnNextButton(35);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 3/6', 36);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graph-visualization-node-info-types"]');

            // Step described property voc:releaseDate.
            GuideSteps.clickOnNextButton(36);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 4/6', 37);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graph-visualization-node-info-voc:releaseDate"]');

            // Step described property voc:episodeId.
            GuideSteps.clickOnNextButton(37);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 5/6', 38);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graph-visualization-node-info-voc:episodeId"]');

            // Step described close side info panel button.
            GuideSteps.clickOnNextButton(38);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 6/6', 39);
            GuideSteps.verifyIsElementInteractable('[guide-selector="close-info-panel"]');

            // Step described how to expand the visual graph node.
            GuideSteps.clickOnClosePropertiesInfoPanelButton();
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph: expand node', 40);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/film/1"] circle');

            // Step described C-3P0.
            GuideSteps.dblclickOnVisualGraphNodeButton('https://swapi.co/resource/film/1');
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 41);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/droid/2"] circle');

            // Step described planet Tatooine.
            GuideSteps.clickOnNextButton(41);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 42);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/planet/1"] circle');

            // Step described SPARQL Query.
            GuideSteps.clickOnNextButton(42);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 1/11', 43);

            // Step click on menu-sparql button.
            GuideSteps.clickOnNextButton(43);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 2/11', 44);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-sparql"]');

            // Step described a query.
            GuideSteps.clickOnNextButton(44);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible(`Execute SPARQL query — 3/11`, 45);
            GuideSteps.verifyIsElementInteractable('[guide-selector="queryEditor"] .CodeMirror-code');

            // Step click on button run.
            GuideSteps.clickOnNextButton(45);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible(`Execute SPARQL query — 4/11`, 46);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            // Step click on button run.
            GuideSteps.clickOnSaprqlRunButton();
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible(`Execute SPARQL query — 5/11`, 47);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');


            // Step described a query.
            GuideSteps.clickOnNextButton(47);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible(`Execute SPARQL query — 6/11`, 48);
            GuideSteps.verifyIsElementInteractable('[guide-selector="queryEditor"] .CodeMirror-code');

            // Step click on button run.
            GuideSteps.clickOnNextButton(48);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible(`Execute SPARQL query — 7/11`, 49);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            // Step click on button run.
            GuideSteps.clickOnSaprqlRunButton();
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible(`Execute SPARQL query — 8/11`, 50);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            // Step described a query.
            GuideSteps.clickOnNextButton(50);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible(`Execute SPARQL query — 9/11`, 51);
            GuideSteps.verifyIsElementInteractable('[guide-selector="queryEditor"] .CodeMirror-code');

            // Step click on button run.
            GuideSteps.clickOnNextButton(51);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible(`Execute SPARQL query — 10/11`, 52);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            // Step click on button run.
            GuideSteps.clickOnSaprqlRunButton();
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible(`Execute SPARQL query — 11/11`, 53);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            GuideSteps.clickOnNextButton(53);
            GuideSteps.waitDialogWithTitleBeVisible('End of guide', 54);

            executePreviousFlowOfStarWarsGuide(REPOSITORY_ID_STARWARS_2);
            GuideSteps.cancelGuide();
            cy.deleteRepository(REPOSITORY_ID_STARWARS_2);
        });

        function executePreviousFlowOfStarWarsGuide(repositoryId) {
            // Last step has not "Next", "Pause" and "Skip" buttons.
            GuideSteps.verifyNextButtonNotVisible();
            GuideSteps.verifyPauseButtonNotVisible();
            GuideSteps.verifySkipButtonNotVisible();

            // We are reached the end of the guide, now we will go to the start.

            GuideSteps.clickOnPreviousButton(54);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 11/11', 53);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            GuideSteps.clickOnPreviousButton(53);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 10/11', 52);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            GuideSteps.clickOnPreviousButton(52);
            cy.scrollTo('top');
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 9/11', 51);
            GuideSteps.verifyIsElementInteractable('[guide-selector="queryEditor"] .CodeMirror-code');

            GuideSteps.clickOnPreviousButton(51);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 8/11', 50);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            GuideSteps.clickOnPreviousButton(50);
            cy.scrollTo('top');
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 7/11', 49);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            GuideSteps.clickOnPreviousButton(49);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 6/11', 48);
            GuideSteps.verifyIsElementInteractable('[guide-selector="queryEditor"] .CodeMirror-code');

            GuideSteps.clickOnPreviousButton(48);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 5/11', 47);
            GuideSteps.verifyIsElementInteractable('[guide-selector="yasrResults"]');

            GuideSteps.clickOnPreviousButton(47);
            GuideSteps.verifyPageNotInteractive();
            cy.scrollTo('top');
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 4/11', 46);
            GuideSteps.verifyIsElementInteractable('[guide-selector="runSparqlQuery"]');

            GuideSteps.clickOnPreviousButton(46);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 3/11', 45);
            GuideSteps.verifyIsElementInteractable('[guide-selector="queryEditor"] .CodeMirror-code');

            GuideSteps.clickOnPreviousButton(45);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 2/11', 44);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-sparql"]');

            GuideSteps.clickOnPreviousButton(44);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Execute SPARQL query — 1/11', 43);

            // Step described planet Tatooine.
            GuideSteps.clickOnPreviousButton(43);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 42);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/planet/1"] circle');

            // Step described C-3P0.
            GuideSteps.clickOnPreviousButton(42);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 41);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/droid/2"] circle');

            // Step described how to expand the visual graph node.
            GuideSteps.clickOnPreviousButton(41);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph: expand node', 40);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/film/1"] circle');

            // Step described close side info panel button.
            GuideSteps.clickOnPreviousButton(40);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.verifyIsElementInteractable('[guide-selector="close-info-panel"]');
            // cy.wait(3000);
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 6/6', 39);

            // Step described property voc:episodeId.
            GuideSteps.clickOnPreviousButton(39, true);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 5/6', 38);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graph-visualization-node-info-voc:episodeId"]');

            // Step described property voc:releaseDate.
            GuideSteps.clickOnPreviousButton(38);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 4/6', 37);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graph-visualization-node-info-voc:releaseDate"]');

            // Step described property voc:Film.
            GuideSteps.clickOnPreviousButton(37);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 3/6', 36);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graph-visualization-node-info-types"]');

            // Step described side info panel.
            GuideSteps.clickOnPreviousButton(36);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 2/6', 35);
            GuideSteps.verifyIsElementInteractable('.rdf-side-panel-content');

            // Step described the film "A New Hope"
            GuideSteps.clickOnPreviousButton(35);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph properties — 1/6', 34);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/film/1"] circle');

            // Step described another vehicle.
            GuideSteps.clickOnPreviousButton(34);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 33);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/vehicle/30"] circle');

            // Step described that about Luke's vehicle.
            GuideSteps.clickOnPreviousButton(33);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph links', 32);
            GuideSteps.verifyIsElementInteractable('.link-wrapper[id^="https://swapi.co/resource/human/1>https://swapi.co/resource/vehicle/14"]');

            // Step described that Luke is of type Mammal.
            GuideSteps.clickOnPreviousButton(32);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 31);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/vocabulary/Mammal"] circle');

            // Step described that Luke is of type Character.
            GuideSteps.clickOnPreviousButton(31);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph links', 30);
            GuideSteps.verifyIsElementInteractable('.link-wrapper[id^="https://swapi.co/resource/human/1>https://swapi.co/vocabulary/Character"]');

            // Step describe Luke Skywalker node.
            GuideSteps.clickOnPreviousButton(30);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph nodes', 29);
            GuideSteps.verifyIsElementInteractable('.node-wrapper[id^="https://swapi.co/resource/human/1"] circle');

            // Step described visual graph of Luke Skywalker.
            GuideSteps.clickOnPreviousButton(29);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 6/6', 28);

            // Step click on Luke Skywalker autocomplete.
            GuideSteps.clickOnPreviousButton(28);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 5/6', 27);
            GuideSteps.verifyIsElementInteractable('[guide-selector="autocomplete-https://swapi.co/resource/human/1"]');

            // Step enter search RDF resource criteria.
            GuideSteps.clickOnPreviousButton(27);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 4/6', 26);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graphVisualisationSearchInputNotConfigured"]');

            // Step select "Visual graph" menu
            GuideSteps.clickOnPreviousButton(26);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 3/6', 25);
            GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-visual-graph"]');

            // Step select menu explore.
            GuideSteps.clickOnPreviousButton(25);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 2/6', 24);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-explore"]');

            // Step click on Import button.
            GuideSteps.clickOnPreviousButton(24);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Visual graph explore — 1/6', 23);

            // Step click on import starwars.ttl file
            GuideSteps.clickOnPreviousButton(23);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Import file — 7/7', 22);
            cy.get('[guide-selector="import-status-info"] .import-status-message:visible').contains('Imported successfully');
            GuideSteps.verifyIsElementInteractable('[guide-selector="import-file-' + repositoryId + '.ttl"]');

            GuideSteps.clickOnPreviousButton(22);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Import file — 6/7', 21);

            // Step click Upload RDF files button.
            GuideSteps.clickOnPreviousButton(21);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Import file — 5/7', 20);
            GuideSteps.verifyIsElementInteractable('[guide-selector="uploadRdfFileButton"]');

            // Step described download of file.
            GuideSteps.clickOnPreviousButton(20);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Import file — 4/7', 19);

            GuideSteps.clickOnPreviousButton(19);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Import file — 3/7', 18);

            // Step select "Import" button.
            GuideSteps.clickOnPreviousButton(18);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Import file — 2/7', 17);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-import"]');

            // Step import file intro
            GuideSteps.clickOnPreviousButton(17);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Import file — 1/7', 16);

            // Step wait autocomplete indexing complete
            GuideSteps.clickOnPreviousButton(16);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 5/5', 15);
            GuideSteps.verifyIsElementInteractable('[guide-selector="autocompleteStatus"]');

            // Step enable autocomplete index.
            GuideSteps.clickOnPreviousButton(15);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 4/5', 14);
            GuideSteps.verifyIsElementInteractable('[guide-selector="autocompleteCheckbox"]');

            // Step select autocomplete.
            GuideSteps.clickOnPreviousButton(14);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 3/5', 13);
            GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-autocomplete"]');

            // Step select menu setup.
            GuideSteps.clickOnPreviousButton(13);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 2/5', 12);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-setup"]');

            // Step described autocomplete.
            GuideSteps.clickOnPreviousButton(12);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 1/5', 11);

            // Step select "starwars" repository button.
            GuideSteps.clickOnPreviousButton(11);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Connect to repository — 2/2', 10);
            GuideSteps.verifyIsElementInteractable('[guide-selector="repository-' + repositoryId + '-button"]');

            // Step select "Choose repository" button.
            GuideSteps.clickOnPreviousButton(10);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Connect to repository — 1/2', 9);
            GuideSteps.verifyIsElementInteractable('[guide-selector="repositoriesGroupButton"]');

            // Step select "Create" repository button.
            GuideSteps.clickOnPreviousButton(9);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Create repository — 7/7', 8);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graphDBRepositoryCrateButton"]');

            // Step enter "Repository ID".
            GuideSteps.clickOnPreviousButton(8);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Create repository — 6/7', 7);
            GuideSteps.verifyIsElementInteractable('[guide-selector="graphDBRepositoryIdInput"]');

            // Step click on button "GraphDB Repository".
            GuideSteps.clickOnPreviousButton(7);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Create repository — 5/7', 6);
            GuideSteps.verifyIsElementInteractable('[guide-selector="createGraphDBRepository"]');

            // Step select repository.
            GuideSteps.clickOnPreviousButton(6);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Create repository — 4/7', 5);
            GuideSteps.verifyIsElementInteractable('[guide-selector="createRepository"]');

            // Step select menu "Repositories".
            GuideSteps.clickOnPreviousButton(5);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Create repository — 3/7', 4);
            GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-repositories"]');

            // Step select menu "Setup".
            GuideSteps.clickOnPreviousButton(4);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Create repository — 2/7', 3);
            GuideSteps.verifyIsElementInteractable('[guide-selector="menu-setup"]');
            GuideSteps.verifyIsNotElementInteractable('[guide-selector="sub-menu-repositories"]');

            // Step Welcome to Star Wars guide
            GuideSteps.clickOnPreviousButton(3);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Create repository — 1/7', 2);

            GuideSteps.clickOnPreviousButton(2);
            GuideSteps.verifyPageNotInteractive();
            GuideSteps.waitDialogWithTitleBeVisible('Welcome to', 1);
            GuideSteps.waitDialogWithTitleBeVisible('— 2/2', 1);

            GuideSteps.clickOnPreviousButton(1);
            GuideSteps.verifyPageNotInteractive();

            // First step has not "Previous", "Pause" and "Skip" buttons.
            GuideSteps.verifyPauseButtonNotVisible();
            GuideSteps.verifyPauseButtonNotVisible();
            GuideSteps.verifySkipButtonNotVisible();
        }
    });

    function createRepository(repositoryId) {
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 1/7', 2);

        // Step select menu "Setup".
        GuideSteps.clickOnNextButton(2);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 2/7', 3);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="menu-setup"]');
        GuideSteps.verifyIsNotElementInteractable('[guide-selector="sub-menu-repositories"]');

        // Step select menu "Repositories".
        GuideSteps.clickOnMenuSetup();
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 3/7', 4);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-repositories"]');

        // Step select repository.
        GuideSteps.clickOnSubMenuRepositories();
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 4/7', 5);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="createRepository"]');

        // Step click on button "GraphDB Repository".
        GuideSteps.clickOnOpenCreateRepositoryFormButton();
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 5/7', 6);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="createGraphDBRepository"]');

        // Step enter "Repository ID".
        GuideSteps.clickOnGraphDBRepositoryButton();
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 6/7', 7);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="graphDBRepositoryIdInput"]');

        // Step select "Create" repository button.
        GuideSteps.clickOnNextButton(7);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 7/7', 8);
        GuideSteps.verifyPageNotInteractive();
        cy.get('[guide-selector="graphDBRepositoryIdInput"]').should('have.value', repositoryId);
        GuideSteps.verifyIsElementInteractable('[guide-selector="graphDBRepositoryCrateButton"]');

        GuideSteps.clickOnCreateRepositoryButton();
        GuideSteps.verifyPageNotInteractive();
    }

    function createRepositoryByNextButton(repositoryId) {
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 1/7', 2);

        // Step select menu "Setup".
        GuideSteps.clickOnNextButton(2);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 2/7', 3);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="menu-setup"]');
        GuideSteps.verifyIsNotElementInteractable('[guide-selector="sub-menu-repositories"]');

        // Step select menu "Repositories".
        GuideSteps.clickOnNextButton(3);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 3/7', 4);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-repositories"]');

        // Step select repository.
        GuideSteps.clickOnNextButton(4);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 4/7', 5);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="createRepository"]');

        // Step click on button "GraphDB Repository".
        GuideSteps.clickOnNextButton(5);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 5/7', 6);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="createGraphDBRepository"]');

        // Step enter "Repository ID".
        GuideSteps.clickOnNextButton(6);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 6/7', 7);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="graphDBRepositoryIdInput"]');

        // Step select "Create" repository button.
        GuideSteps.clickOnNextButton(7);
        GuideSteps.waitDialogWithTitleBeVisible('Create repository — 7/7', 8);
        GuideSteps.verifyPageNotInteractive();
        cy.get('[guide-selector="graphDBRepositoryIdInput"]').should('have.value', repositoryId);
        GuideSteps.verifyIsElementInteractable('[guide-selector="graphDBRepositoryCrateButton"]');

        GuideSteps.clickOnNextButton(8);
        GuideSteps.verifyPageNotInteractive();
    }

    function selectRepository(repositoryId) {
        GuideSteps.waitDialogWithTitleBeVisible('Connect to repository — 1/2', 9);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="repositoriesGroupButton"]');

        // Step select "starwars" repository button.
        GuideSteps.clickOnChooseRepositoryButton();
        GuideSteps.waitDialogWithTitleBeVisible('Connect to repository — 2/2', 10);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="repository-' + repositoryId + '-button"]');

        // Step described autocomplete.
        GuideSteps.clickOnSelectRepositoryButton(repositoryId);
    }

    function selectRepositoryByNextButton(repositoryId) {
        GuideSteps.waitDialogWithTitleBeVisible('Connect to repository — 1/2', 9);
        GuideSteps.verifyIsElementInteractable('[guide-selector="repositoriesGroupButton"]');

        // Step select "starwars" repository button.
        GuideSteps.clickOnNextButton(9);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.waitDialogWithTitleBeVisible('Connect to repository — 2/2', 10);
        GuideSteps.verifyIsElementInteractable('[guide-selector="repository-' + repositoryId + '-button"]');
    }

    function enableAutocomplete() {
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 1/5', 11);
        GuideSteps.verifyPageNotInteractive();

        // Step select menu setup.
        GuideSteps.clickOnNextButton(11);
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 2/5', 12);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="menu-setup"]');

        // Step select autocomplete.
        GuideSteps.clickOnMenuSetup();
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 3/5', 13);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-autocomplete"]');

        // Step enable autocomplete index.
        GuideSteps.clickOnSubMenuAutocompleteButton();
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 4/5', 14);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="autocompleteCheckbox"]');

        // Step wait autocomplete indexing complete
        GuideSteps.clickOnEnableAutocompleteButton();
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 5/5', 15);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="autocompleteStatus"]');
        cy.get('.tag.tag-success.ng-binding:visible').contains('Ready');

        GuideSteps.clickOnNextButton(15);
        GuideSteps.verifyPageNotInteractive();
    }

    function enableAutocompleteByNextButton() {
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 1/5', 11);

        // Step select menu setup.
        GuideSteps.clickOnNextButton(11);
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 2/5', 12);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="menu-setup"]');

        // Step select autocomplete.
        GuideSteps.clickOnNextButton(12);
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 3/5', 13);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="sub-menu-autocomplete"]');

        // Step enable autocomplete index.
        GuideSteps.clickOnNextButton(13);
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 4/5', 14);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="autocompleteCheckbox"]');

        // Step wait autocomplete indexing complete
        GuideSteps.clickOnNextButton(14);
        GuideSteps.waitDialogWithTitleBeVisible('Enable autocomplete — 5/5', 15);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="autocompleteStatus"]');
        cy.get('.tag.tag-success.ng-binding:visible').contains('Ready');
    }

    function importFile(fileToImport) {
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 1/7', 16);
        GuideSteps.verifyPageNotInteractive();

        // Step select "Import" button.
        GuideSteps.clickOnNextButton(16);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 2/7', 17);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="menu-import"]');

        // Step described download of file.
        GuideSteps.clickOnMenuImportButton();
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 3/7', 18);
        GuideSteps.verifyPageNotInteractive();

        // Step click Upload RDF files button.
        GuideSteps.clickOnNextButton(18);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 4/7', 19);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="uploadRdfFileButton"]');

        GuideSteps.uploadFile(fileToImport);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 5/7', 20);

        // Step click on import starwars.ttl file
        GuideSteps.verifyIsElementInteractable('[guide-selector="import-file-' + fileToImport + '"]');
        GuideSteps.clickOnImportRepositoryRdfFileButton(fileToImport);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 6/7', 21);
        GuideSteps.verifyPageNotInteractive();

        // Step click on Import button.
        GuideSteps.clickOnImportButton();
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 7/7', 22);
        GuideSteps.verifyPageNotInteractive();
        cy.get('[guide-selector="import-status-info"] .import-status-message:visible').contains('Imported successfully');

        // Step visual graph intro
        GuideSteps.clickOnNextButton(22);
    }

    function importFileByNextButton(fileToImport) {
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 1/7', 16);

        // Step select "Import" button.
        GuideSteps.clickOnNextButton(16);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 2/7', 17);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="menu-import"]');

        // Step described download of file.
        GuideSteps.clickOnNextButton(17);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 3/7', 18);

        // Step click Upload RDF files button.
        GuideSteps.clickOnNextButton(18);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 4/7', 19);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.verifyIsElementInteractable('[guide-selector="uploadRdfFileButton"]');

        GuideSteps.uploadFile(fileToImport);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 5/7', 20);

        // Step click on import starwars.ttl file
        GuideSteps.verifyIsElementInteractable('[guide-selector="import-file-' + fileToImport + '"]');
        GuideSteps.clickOnNextButton(20);
        GuideSteps.verifyPageNotInteractive();
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 6/7', 21);

        // Step click on Import button.
        GuideSteps.clickOnNextButton(21);
        GuideSteps.waitDialogWithTitleBeVisible('Import file — 7/7', 22);
        GuideSteps.verifyPageNotInteractive();
        cy.get('[guide-selector="import-status-info"] .import-status-message:visible').contains('Imported successfully');
    }
});
