import {GuidesStubs} from "../../../stubs/guides/guides-stubs.js";
import {GuideSteps} from "../../../steps/guides/guide-steps.js";
import {GuideDialogSteps} from "../../../steps/guides/guide-dialog-steps.js";
import {YasrSteps} from "../../../steps/yasgui/yasr-steps.js";
import {ResourceSteps} from "../../../steps/resource/resource-steps.js";

describe('Table Graph explore', () => {
    const FILE_TO_IMPORT = 'wine.rdf';
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'table-graph-explore-guide-step-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    describe('Table Graph explore without substeps', () => {
        beforeEach(() => {
            GuidesStubs.stubTableGraphExploreWithoutSubstepsGuide();

            GuideSteps.visit();
            GuideSteps.verifyGuidesListExists();
            cy.wait('@getGuides');
            GuideSteps.runFirstGuide();
        });

        it('Should explore visual graph (User interaction)', () => {
            // GIVEN: A guide is started, and there are results in the SPARQL editor.
            GuideDialogSteps.clickOnNextButton();

            // WHEN: I click on a resource link in the results table.
            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 1/2');
            GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to explore RDF data in tabular form without writing SPARQL queries. Click on the wine#madeFromGrape IRI to explore it.');
            YasrSteps.clickOnResource(48, 1);

            // THEN: I expect to see a dialog in the resource view.
            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 2/2');
            GuideDialogSteps.assertDialogWithContentIsVisible('The table shows RDF statements where the subject is the selected IRI, wine#madeFromGrape. The view can be configured to show statements where the IRI is the subject, predicate, object, context or in any position.');
            GuideDialogSteps.clickOnNextButton();

            // AND: The guide should end.
            GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
            GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
        });

        it('Should explore visual graph (Next flow)', () => {
            // GIVEN: A guide is started, and there are results in the SPARQL editor.
            GuideDialogSteps.clickOnNextButton();

            // WHEN: I proceed using the Next button.
            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 1/2');
            GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to explore RDF data in tabular form without writing SPARQL queries. Click on the wine#madeFromGrape IRI to explore it.');
            GuideDialogSteps.clickOnNextButton();

            // THEN: I expect to see a dialog in the resource view.
            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 2/2');
            GuideDialogSteps.assertDialogWithContentIsVisible('The table shows RDF statements where the subject is the selected IRI, wine#madeFromGrape. The view can be configured to show statements where the IRI is the subject, predicate, object, context or in any position.');
            GuideDialogSteps.clickOnNextButton();

            // AND: The guide should end.
            GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
            GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended');
        });
    });

    describe('Table Graph explore', () => {
        beforeEach(() => {
            GuidesStubs.stubTableGraphExploreGuide();

            GuideSteps.visit();
            GuideSteps.verifyGuidesListExists();
            cy.wait('@getGuides');
            GuideSteps.runFirstGuide();
        });

        it('Should explore visual graph (User interaction)', () => {
            // GIVEN: A guide is started, and there are results in the SPARQL editor.
            GuideDialogSteps.clickOnNextButton();

            // WHEN: I click on the resource link highlighted in the guide dialog.
            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 1/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to explore RDF data in tabular form without writing SPARQL queries. Click on the wine#madeFromGrape IRI to explore it.');
            YasrSteps.clickOnResource(48, 1);

            // THEN: I expect to see a dialog in the resource view.
            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 2/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('The table shows RDF statements where the subject is the selected IRI, wine#madeFromGrape. The view can be configured to show statements where the IRI is the subject, predicate, object, context or in any position.');
            GuideDialogSteps.clickOnNextButton();

            // AND: The guide continues with substeps.
            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 3/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('You can click on any IRI in the table to navigate to it. Click on vin:WineGrape.');
            YasrSteps.clickOnResource(2, 3);

            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 4/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('The table provides an easy way to view triples in which a given IRI is the subject, predicate, or object.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 5/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('You can configure the view to show RDF statements where the current IRI is the subject, predicate, object, context or in any position. Click on the all tab.This is an extra content');
            ResourceSteps.selectRole('all');

            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 6/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('You can always explore the same data using the Visual graph view. Click on the Visual graph button to try it now.');
            ResourceSteps.clickOnVisualGraphButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 7/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('The graph shows connections between the start node, vin:WineGrape, and other nodes. Each arrow represents one or more connections (RDF statements).');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 8/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('You can click on any IRI in the table to navigate to it. Click on wine#madeFromGrape.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
            GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
        });

        it('Should explore visual graph (Next flow)', () => {
            // GIVEN: A guide is started, and there are results in the SPARQL editor.
            GuideDialogSteps.clickOnNextButton();

            // WHEN: I proceed using the Next button.
            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 1/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to explore RDF data in tabular form without writing SPARQL queries. Click on the wine#madeFromGrape IRI to explore it.');
            GuideDialogSteps.clickOnNextButton();

            // THEN: I expect to see a dialog in the resource view.
            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 2/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('The table shows RDF statements where the subject is the selected IRI, wine#madeFromGrape. The view can be configured to show statements where the IRI is the subject, predicate, object, context or in any position.');
            GuideDialogSteps.clickOnNextButton();

            // AND: The guide continues with substeps.
            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 3/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('You can click on any IRI in the table to navigate to it. Click on vin:WineGrape.');
            YasrSteps.clickOnResource(2, 3);

            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 4/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('The table provides an easy way to view triples in which a given IRI is the subject, predicate, or object.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 5/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('You can configure the view to show RDF statements where the current IRI is the subject, predicate, object, context or in any position. Click on the all tab.This is an extra content');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 6/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('You can always explore the same data using the Visual graph view. Click on the Visual graph button to try it now.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 7/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('The graph shows connections between the start node, vin:WineGrape, and other nodes. Each arrow represents one or more connections (RDF statements).');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Explore RDF as a table — 8/8');
            GuideDialogSteps.assertDialogWithContentIsVisible('You can click on any IRI in the table to navigate to it. Click on wine#madeFromGrape.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
            GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
        });
    });
});
