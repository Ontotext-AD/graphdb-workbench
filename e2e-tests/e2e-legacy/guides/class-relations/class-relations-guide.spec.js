import {GuideSteps} from '../../../steps/guides/guide-steps.js';
import {GuideDialogSteps} from '../../../steps/guides/guide-dialog-steps.js';
import {MainMenuSteps} from '../../../steps/main-menu-steps.js';
import {GuidesStubs} from '../../../stubs/guides/guides-stubs.js';

describe('Class relations guide steps', () => {
    let repositoryId;
    const FILE_TO_IMPORT = 'swapi-dataset.ttl';
    const SECOND_FILE_TO_IMPORT = 'wine.rdf';

    beforeEach(() => {
        repositoryId = 'class-relations-guide-' + Date.now();
        GuidesStubs.stubClassRelationsGuide();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        cy.importServerFile(repositoryId, SECOND_FILE_TO_IMPORT, {context: 'http://wine.org/'});

        GuideSteps.visit();
        GuideSteps.verifyGuidesListExists();
        cy.wait('@getGuides');
        GuideSteps.runFirstGuide();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should test class relations guide steps', () => {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class relationships — 1/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Class relationships view to explore how classes are connected and understand the relationships between different types of data in your dataset.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class relationships — 2/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
        MainMenuSteps.clickOnExplore();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class relationships — 3/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Class relationships menu.');
        MainMenuSteps.clickOnSubmenuClassRelationships();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class relationships — 4/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('This view shows how data instances from different classes are connected based on real RDF statements.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class relationships — 5/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Some extra info');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Class relationships');
        GuideDialogSteps.assertDialogWithContentIsVisible('Each connection line varies in thickness based on the number of links, color based on the class with more incoming links, and direction as links may go both ways (from class A to class B and vice versa).');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Class relationships');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on any connection line in the diagram to see the top predicates used between those two classes. This helps to understand what kind of relationships link them.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Class relationships');
        GuideDialogSteps.assertDialogWithContentIsVisible('If the repository contains more than one named graph, you can filter the view by opening the All graphs dropdown (next to the toolbar) and selecting the graph to explore.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Class relationships');
        GuideDialogSteps.assertDialogWithContentIsVisible('The left panel shows all classes, sorted by number of links, displaying both incoming and outgoing connections.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Class relationships');
        GuideDialogSteps.assertDialogWithContentIsVisible('A green background behind a class name in the list indicates that it is currently shown in the diagram.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Class relationships');
        GuideDialogSteps.assertDialogWithContentIsVisible('Use the + / – icons next to each class name to add or remove it from the diagram display.');

        GuideDialogSteps.clickOnCloseButton();
        GuideDialogSteps.assertDialogIsClosed();
    });
});
