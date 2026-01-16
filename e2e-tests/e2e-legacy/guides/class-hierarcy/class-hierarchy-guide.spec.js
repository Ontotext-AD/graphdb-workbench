import {GuideSteps} from '../../../steps/guides/guide-steps.js';
import {GuideDialogSteps} from '../../../steps/guides/guide-dialog-steps.js';
import {MainMenuSteps} from '../../../steps/main-menu-steps.js';
import {GuidesStubs} from '../../../stubs/guides/guides-stubs.js';
import ClassViewsSteps from '../../../steps/class-views-steps.js';

describe('Class hierarchy guide steps', () => {
    let repositoryId;
    const FILE_TO_IMPORT = 'swapi-dataset.ttl';

    beforeEach(() => {
        repositoryId = 'class-hierarchy-guide-' + Date.now();
        GuidesStubs.stubClassHierarchyGuide();
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

    it('Should test class hierarchy', () => {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 1/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on voc:Sentient to show its instances.');
        ClassViewsSteps.selectClassElement('voc:Sentient');

        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 2/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('The side panel shows the first 1,000 instances of the clicked class, voc:Sentient.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 3/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('https://swapi.co/resource/aleena/47 is an instance of the class voc:Sentient.');
        GuideDialogSteps.assertDialogWithContentIsVisible('This is planet');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 4/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('This link shows the number of instances for the selected class, voc:Sentient. Click on the link to open the SPARQL editor with a preloaded query that selects all instances.');
        ClassViewsSteps.clickInstanceCountLink();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 5/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('This SPARQL query selects all instances of the class voc:Sentient. The query was entered automatically when you clicked on the view instances link.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 6/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('The table shows the results. Note that in this particular case, the query was executed automatically.');
        GuideDialogSteps.assertDialogWithContentIsVisible('Do not worry — there will be a dedicated section on the SPARQL editor later in the guide.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Class hierarchy instances — 7/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('You can close the panel by clicking on the X icon.');
        ClassViewsSteps.closeInfoSidePanel();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 1/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Class hierarchy view to inspect the class hierarchy and gain an insight on what the dataset contains.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 2/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
        MainMenuSteps.clickOnExplore();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 3/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Class hierarchy menu.');
        MainMenuSteps.clickOnSubmenuClassHierarchy();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 4/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('The biggest circle shows all top-level classes. Every class may have subclasses shown as smaller circles within their parent class. The size of each circle indicates the proportion of RDF resources that belong to that class. Thus, bigger circles are classes that have more instances.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 5/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('This is some extra content here');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 6/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('The class voc:Sentient is a parent class that has subclasses. Zoom inside to have a better view by scrolling up with the mouse inside the circle.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 7/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('Within voc:Sentient are subclasses like voc:Human (humanoids), voc:Droid (mechanical intelligences), voc:Gungan (the Gungan species), and voc:Yodasspecies (Yoda’s lineage), highlighting the diverse forms of sentient life.');

        GuideDialogSteps.clickOnCloseButton();
        GuideDialogSteps.assertDialogIsClosed();
    });
});
