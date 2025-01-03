import {GuideSteps} from "./guide-steps";
import {GuideDialogSteps} from "./guide-dialog-steps";
import {MainMenuSteps} from "../main-menu-steps";
import {VisualGraphSteps} from "../visual-graph-steps";
import {YasqeSteps} from "../yasgui/yasqe-steps";
import {YasrSteps} from "../yasgui/yasr-steps";

export class StarWarsGuideSteps {

    static assertVisualGraphExploreStep1() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 1/6');
    }

    static assertVisualGraphExploreStep2() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 2/6');
        MainMenuSteps.getMenuExplore().should('be.visible');
    }

    static assertVisualGraphExploreStep3() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 3/6');
        MainMenuSteps.getSubmenuVisualGraph().should('be.visible');
    }

    static assertVisualGraphExploreSte4() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 4/6');
        VisualGraphSteps.getStartNodeSelectorField().should('be.visible');
    }

    static assertVisualGraphExploreSte5() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 5/6');
        VisualGraphSteps.getResultItemField().should('be.visible');
    }

    static assertVisualGraphExploreSte6() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 6/6');
    }

    static assertSte30() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph nodes');
        VisualGraphSteps.getCircleOfNodeByNodeId('https://swapi.co/resource/human/1').should('be.visible');
    }

    static assertSte31() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph links');
        VisualGraphSteps.getLineBetweenNodesById('https://swapi.co/resource/human/1>https://swapi.co/vocabulary/Character').should('be.visible');
    }

    static assertSte32() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph nodes');
        VisualGraphSteps.getCircleOfNodeByNodeId('https://swapi.co/vocabulary/Mammal').should('be.visible');
    }

    static assertSte33() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph links');
        VisualGraphSteps.getLineBetweenNodesById('https://swapi.co/resource/human/1>https://swapi.co/resource/vehicle/14').should('be.visible');
    }

    static assertSte34() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph nodes');
        VisualGraphSteps.getCircleOfNodeByNodeId('https://swapi.co/resource/vehicle/30').should('be.visible');
    }

    static assertVisualGraphPropertiesStep1() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 1/6');
        VisualGraphSteps.getCircleOfNodeByNodeId('https://swapi.co/resource/film/1').should('be.visible');
    }

    static assertVisualGraphPropertiesStep2() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 2/6');
        VisualGraphSteps.getSidePanelContent().should('be.visible');
    }

    static assertVisualGraphPropertiesStep3() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 3/6');
        GuideSteps.getElementByGuideSelector('graph-visualization-node-info-types').should('be.visible');
    }

    static assertVisualGraphPropertiesStep4() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 4/6');
        GuideSteps.getElementByGuideSelector('graph-visualization-node-info-voc:releaseDate').should('be.visible');
    }

    static assertVisualGraphPropertiesStep5() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 5/6');
        GuideSteps.getElementByGuideSelector('graph-visualization-node-info-voc:episodeId').should('be.visible');
    }

    static assertVisualGraphPropertiesStep6() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph properties — 6/6');
        GuideSteps.getElementByGuideSelector('close-info-panel').should('be.visible');
    }

    static assertStep41() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph: expand node');
        VisualGraphSteps.getCircleOfNodeByNodeId('https://swapi.co/resource/film/1').should('be.visible');
    }

    static assertStep42() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph nodes');
        VisualGraphSteps.getCircleOfNodeByNodeId('https://swapi.co/resource/planet/1').should('be.visible');
    }

    static assertStep43() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph nodes');
        VisualGraphSteps.getCircleOfNodeByNodeId('https://swapi.co/resource/droid/2').should('be.visible');
    }

    static assertExecuteSparqlQueryStep1() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 1/11');
    }

    static assertExecuteSparqlQueryStep2() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 2/11');
        MainMenuSteps.getMenuSparql().should('be.visible');
    }

    static assertExecuteSparqlQueryStep3() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 3/11');
    }

    static assertExecuteSparqlQueryStep4() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 4/11');
        YasqeSteps.getExecuteQueryButton().should('be.visible');
    }

    static assertExecuteSparqlQueryStep5() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 5/11');
        YasrSteps.getResults().should('be.visible');
    }

    static assertExecuteSparqlQueryStep6() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 6/11');
    }

    static assertExecuteSparqlQueryStep7() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 7/11');
        YasrSteps.getResults().should('be.visible');
    }

    static assertExecuteSparqlQueryStep8() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 8/11');
        YasrSteps.getResults().should('be.visible');
    }

    static assertExecuteSparqlQueryStep9() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 9/11');
    }

    static assertExecuteSparqlQueryStep10() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 10/11');
        YasrSteps.getResults().should('be.visible');
    }

    static assertExecuteSparqlQueryStep11() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 11/11');
    }
}
