import {GuidesStubs} from "../../../stubs/guides/guides-stubs.js";
import {GuideSteps} from "../../../steps/guides/guide-steps.js";
import {GuideDialogSteps} from "../../../steps/guides/guide-dialog-steps.js";
import {MainMenuSteps} from "../../../steps/main-menu-steps.js";
import {VisualGraphSteps} from "../../../steps/visual-graph-steps.js";

describe('Visual Graph', () => {
    const FILE_TO_IMPORT = 'wine.rdf';
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'visual-graph-guide-step-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.enableAutocomplete(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    describe('Visual graph explore guide', () => {
        beforeEach(() => {
            GuidesStubs.stubVisualGraphGuide();
            GuideSteps.visit();
            GuideSteps.verifyGuidesListExists();
            cy.wait('@getGuides');
            GuideSteps.runFirstGuide();
        });

        it('Should explore the visual graph (User interaction)', () => {
            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 1/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Visual graph view to explore data in a visual manner.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 2/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
            MainMenuSteps.clickOnExplore();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 3/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Visual graph menu.');
            MainMenuSteps.clickOnSubmenuVisualGraph();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 4/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('Enter wine in the Easy graph text input.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 5/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Wine IRI to show the visual graph.');
            VisualGraphSteps.clickOnAutocompleteElement('wine <http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Wine>');

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 6/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('The graph shows connections between the start node, wine, and other nodes. Each arrow represents one or more connections (RDF statements).');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph nodes');
            GuideDialogSteps.assertDialogWithContentIsVisible('A circle represents an RDF resource. In this case, wine.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph links');
            GuideDialogSteps.assertDialogWithContentIsVisible('An arrow with a label represents one or more links between nodes. In this case, the arrow shows the relation Wine → type → Potable Liquid.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 1/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on Wine to show its properties.');
            VisualGraphSteps.clickOnNode('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Wine');

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 2/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('The side panel shows the properties of the clicked node, Wine.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 3/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('Types shows all the RDF types for Wine.We can see that Wine has a single type, owl:Class.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 4/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('The values for generic properties like rdfs:label are listed in dedicated sections.This shows the label of Wine.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 5/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('This shows the label of Wine.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 6/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('You can close the panel by clicking on the X icon.');
            VisualGraphSteps.closeSidePanel();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph: expand node');
            GuideDialogSteps.assertDialogWithContentIsVisible('Double click on Whitehall Lane Primavera to expand the graph.');
            VisualGraphSteps.dblclickOnNode('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#WhitehallLanePrimavera');

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph nodes');
            GuideDialogSteps.assertDialogWithContentIsVisible('A circle represents an RDF resource. In this case, Napa Region.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
            GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
        });

        it('Should explore the visual graph (Next flow)', () => {
            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 1/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Visual graph view to explore data in a visual manner.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 2/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 3/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Visual graph menu.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 4/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('Enter wine in the Easy graph text input.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 5/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Wine IRI to show the visual graph.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 6/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('The graph shows connections between the start node, wine, and other nodes. Each arrow represents one or more connections (RDF statements).');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph nodes');
            GuideDialogSteps.assertDialogWithContentIsVisible('A circle represents an RDF resource. In this case, wine.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph links');
            GuideDialogSteps.assertDialogWithContentIsVisible('An arrow with a label represents one or more links between nodes. In this case, the arrow shows the relation Wine → type → Potable Liquid.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 1/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on Wine to show its properties.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 2/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('The side panel shows the properties of the clicked node, Wine.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 3/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('Types shows all the RDF types for Wine.We can see that Wine has a single type, owl:Class.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 4/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('The values for generic properties like rdfs:label are listed in dedicated sections.This shows the label of Wine.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 5/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('This shows the label of Wine.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 6/6');
            GuideDialogSteps.assertDialogWithContentIsVisible('You can close the panel by clicking on the X icon.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph: expand node');
            GuideDialogSteps.assertDialogWithContentIsVisible('Double click on Whitehall Lane Primavera to expand the graph.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph nodes');
            GuideDialogSteps.assertDialogWithContentIsVisible('A circle represents an RDF resource. In this case, Napa Region.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
            GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
        });
    });

    describe('Visual graph create config guide', () => {
        beforeEach(() => {
            cy.deleteGraphConfig('visual');
            GuidesStubs.stubVisualGraphConfigGuide();
            GuideSteps.visit();
            GuideSteps.verifyGuidesListExists();
            cy.wait('@getGuides');
            GuideSteps.runFirstGuide();
        });

        it('Should create a visual graph config (User interaction)', () => {
            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 1/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 2/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Visual graph menu.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 3/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the create config button to Create graph config.');
            VisualGraphSteps.createCustomGraph();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 4/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Enter a name for your visual graph configuration.');
            VisualGraphSteps.typeGraphConfigName('visual');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 5/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Enter a description: my description');
            VisualGraphSteps.typeGraphConfigDescription('my description');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 6/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Copy and use the following IRI as the starting point for the visual graph: my hint');
            VisualGraphSteps.typeGraphConfigHint('my hint');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 7/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Starting point defines how the visual graph begins when it is opened. It determines the first resource or set of results that will appear in the graph and from which the visualization starts.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 9/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Select Start with a fixed node to always start the visual graph from a specific resource.')
            VisualGraphSteps.selectStartMode('node');

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 10/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Enter the following text: MerlotGrape');
            VisualGraphSteps.searchForRdfResource('MerlotGrape');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 11/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#MerlotGrape');
            VisualGraphSteps.clickOnAutocompleteElement('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#MerlotGrape');

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 12/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Graph expansion tab');
            VisualGraphSteps.openConfigTab(2);

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 13/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Enter the following SPARQL query:');
            GuideDialogSteps.assertDialogWithContentIsVisible('The graph expansion query defines what happens when a node is expanded in the visual graph. Expanding a node loads additional resources connected to it and adds them to the graph as new nodes and edges.');
            GuideDialogSteps.copyQueryToEditor();
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 14/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Include inferred data in results includes inferred statements produced by reasoning in the query results. Clicking the toggle disables this behavior.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 15/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Expand results over owl sameAs includes equivalent resources connected with owl:sameAs in the query results. Clicking the toggle disables this behavior.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 16/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('The Sample queries includes example graph expansion queries. Unfiltered object properties shows all object property connections of a node, while Filtered object properties shows only selected ones.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 17/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Check the Share visual graph with other users box to make the visual graph configuration available to other users in the repository.');
            VisualGraphSteps.shareVisualGraphWithOtherUsers();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 18/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click to save the visual graph configuration.');
            VisualGraphSteps.saveConfig();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 19/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click the visual graph you just created to open and explore it.');
            VisualGraphSteps.selectConfig('visual');

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 20/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on Graph settings.');
            VisualGraphSteps.openVisualGraphSettings();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 21/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Enter 200 as the maximum number of links to show.');
            VisualGraphSteps.updateLinksLimitField(200);
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 22/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click to save the graph settings.');
            VisualGraphSteps.saveSettings();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 23/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Double click on WineGrape to expand the graph.');
            VisualGraphSteps.dblclickOnNode('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#WineGrape')

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 24/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Scrolling with the mouse wheel or two fingers on the touchpad zooms the visual graph in and out.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
        });

        it('Should create a visual graph config (next flow)', () => {
            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 1/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 2/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Visual graph menu.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 3/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the create config button to Create graph config.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 4/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Enter a name for your visual graph configuration.');
            VisualGraphSteps.typeGraphConfigName('visual');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 5/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Enter a description: my description');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 6/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Copy and use the following IRI as the starting point for the visual graph: my hint');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 7/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Starting point defines how the visual graph begins when it is opened. It determines the first resource or set of results that will appear in the graph and from which the visualization starts.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 9/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Select Start with a fixed node to always start the visual graph from a specific resource.')
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 10/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Enter the following text: MerlotGrape');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 11/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#MerlotGrape');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 12/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Graph expansion tab');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 13/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Enter the following SPARQL query:');
            GuideDialogSteps.assertDialogWithContentIsVisible('The graph expansion query defines what happens when a node is expanded in the visual graph. Expanding a node loads additional resources connected to it and adds them to the graph as new nodes and edges.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 14/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Include inferred data in results includes inferred statements produced by reasoning in the query results. Clicking the toggle disables this behavior.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 15/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Expand results over owl sameAs includes equivalent resources connected with owl:sameAs in the query results. Clicking the toggle disables this behavior.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 16/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('The Sample queries includes example graph expansion queries. Unfiltered object properties shows all object property connections of a node, while Filtered object properties shows only selected ones.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 17/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Check the Share visual graph with other users box to make the visual graph configuration available to other users in the repository.');
            VisualGraphSteps.shareVisualGraphWithOtherUsers();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 18/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click to save the visual graph configuration.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 19/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click the visual graph you just created to open and explore it.');
            VisualGraphSteps.selectConfig('visual');

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 20/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on Graph settings.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 21/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Enter 200 as the maximum number of links to show.');
            VisualGraphSteps.updateLinksLimitField(200);
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 22/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click to save the graph settings.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 23/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Double click on WineGrape to expand the graph.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 24/24');
            GuideDialogSteps.assertDialogWithContentIsVisible('Scrolling with the mouse wheel or two fingers on the touchpad zooms the visual graph in and out.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
        });
    });
});
