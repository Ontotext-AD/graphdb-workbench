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
        GuidesStubs.stubVisualGraphGuide();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.enableAutocomplete(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);

        GuideSteps.visit();
        GuideSteps.verifyGuidesListExists();
        cy.wait('@getGuides');
        GuideSteps.runFirstGuide()
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
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
