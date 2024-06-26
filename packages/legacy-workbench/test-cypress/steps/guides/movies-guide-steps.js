import {GuideSteps} from "./guide-steps";
import {GuideDialogSteps} from "./guide-dialog-steps";
import {MainMenuSteps} from "../main-menu-steps";
import {VisualGraphSteps} from "../visual-graph-steps";
import {YasrSteps} from "../yasgui/yasr-steps";
import {YasqeSteps} from "../yasgui/yasqe-steps";
import {ResourceSteps} from "../resource/resource-steps";

export class MoviesGuideSteps {

    static assertExploreClassHierarchyStep1() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 1/7');
    }

    static assertExploreClassHierarchyStep2() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 2/7');
        MainMenuSteps.getMenuExplore().should('be.visible');
    }

    static assertExploreClassHierarchyStep3() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 3/7');
        MainMenuSteps.getSubmenuClassHierarchy().should('be.visible');
    }

    static assertExploreClassHierarchyStep4() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 4/7');
    }

    static assertExploreClassHierarchyStep5() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 5/7');
        VisualGraphSteps.getMainGroupElement().should('be.visible');
    }

    static assertExploreClassHierarchyStep6() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 6/7');
        GuideSteps.getElementByGuideSelector('class-schema:Movie').should('be.visible');
    }

    static assertExploreClassHierarchyStep7() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 7/7');
        GuideSteps.getElementByGuideSelector('class-schema:Movie').should('be.visible');
    }

    static assertClassHierarchyInstancesStep1() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 1/8');
        GuideSteps.getElementByGuideSelector('class-imdb:ColorMovie').should('be.visible');
        GuideSteps.assertIsElementInteractable('[guide-selector="class-imdb:ColorMovie"]');
    }

    static assertClassHierarchyInstancesStep2() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 2/8');
    }

    static assertClassHierarchyInstancesStep3() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 3/8');
        GuideSteps.getElementByGuideSelector('instance-imdb:title/Superman').should('be.visible');
    }

    static assertClassHierarchyInstancesStep4() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 4/8');
        GuideSteps.getElementByGuideSelector('instance-imdb:title/Mulan').should('be.visible');
    }

    static assertClassHierarchyInstancesStep5() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 5/8');
        GuideSteps.getElementByGuideSelector('instances-count').should('be.visible');
    }

    static assertClassHierarchyInstancesStep6() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 6/8');
    }

    static assertClassHierarchyInstancesStep7() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 7/8');
        YasrSteps.getYasr().should('be.visible');
        YasrSteps.getResults().should('have.length', 61);
    }

    static assertClassHierarchyInstancesStep8() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 8/8');
    }

    static assertExecuteSparqlQueryStep1() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 1/8');
    }

    static assertExecuteSparqlQueryStep2() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 2/8');
        MainMenuSteps.getMenuSparql().should('be.visible');
    }

    static assertExecuteSparqlQueryStep3() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 3/8');
    }

    static assertExecuteSparqlQueryStep4() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 4/8');
        YasqeSteps.getExecuteQueryButton().should('be.visible');
    }

    static assertExecuteSparqlQueryStep5() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 5/8');
        YasrSteps.getYasr().should('be.visible');
        YasrSteps.getResults().should('have.length', 13);
    }

    static assertExecuteSparqlQueryStep6() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 6/8');
    }

    static assertExecuteSparqlQueryStep7() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 7/8');
        YasqeSteps.getExecuteQueryButton().should('be.visible');
    }

    static assertExecuteSparqlQueryStep8() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 8/8');
        YasrSteps.getYasr().should('be.visible');
        YasrSteps.getResults().should('have.length', 61);
    }

    static assertExploreRDFStep1() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 1/10');
        YasrSteps.getResultRow(3).should('be.visible');
    }

    static assertExploreRDFStep2() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 2/10');
        YasrSteps.getResults().should('be.visible');
    }

    static assertExploreRDFStep3() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 3/10');
        YasrSteps.getResultRow(0).should('be.visible');
    }

    static assertExploreRDFStep4() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 4/10');
        YasrSteps.getResults().should('be.visible');
    }

    static assertExploreRDFStep5() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 5/10');
        ResourceSteps.getAllRoleTab().should('be.visible');
    }

    static assertExploreRDFStep6() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 6/10');
        YasrSteps.getResults().should('be.visible');
    }

    static assertExploreRDFStep7() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 7/10');
        ResourceSteps.getVisualGraphButton().should('be.visible');
    }

    static assertExploreRDFStep8() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 8/10');
    }

    static assertExploreRDFStep9() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 9/10');
    }

    static assertExploreRDFStep10() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 10/10');
    }

    static assertSparqlQueryStep1() {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 1/7');
        MainMenuSteps.getMenuSparql().should('be.visible');
        GuideSteps.assertPageNotInteractive();
    }

    static assertSparqlQueryStep2() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 2/7');
    }

    static assertSparqlQueryStep3() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 3/7');
        YasqeSteps.getExecuteQueryButton().should('be.visible');
    }

    static assertSparqlQueryStep4() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 4/7');
        YasrSteps.getResults().should('be.visible');
    }

    static assertSparqlQueryStep5() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 5/7');
    }

    static assertSparqlQueryStep6() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 6/7');
        YasqeSteps.getExecuteQueryButton().should('be.visible');
    }

    static assertSparqlQueryStep7() {
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 7/7');
        YasrSteps.getResults().should('be.visible');
    }
}
