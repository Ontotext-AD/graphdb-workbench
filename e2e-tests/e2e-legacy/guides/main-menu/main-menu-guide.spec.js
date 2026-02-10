import {GuidesStubs} from "../../../stubs/guides/guides-stubs.js";
import {GuideSteps} from "../../../steps/guides/guide-steps.js";
import {GuideDialogSteps} from "../../../steps/guides/guide-dialog-steps.js";
import {MainMenuSteps} from "../../../steps/main-menu-steps.js";
import {BaseSteps} from "../../../steps/base-steps.js";

describe('Main Menu Guide steps', () => {

    beforeEach(() => {
        GuidesStubs.stubMainMenuGuide();
        GuideSteps.visit();
        GuideSteps.verifyGuidesListExists();
        cy.wait('@getGuides');
        GuideSteps.runFirstGuide();
    });

    it('Should visit all menus with action', () => {
        // Import
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 1/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Import view to import data from a file.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 2/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Import menu.');
        MainMenuSteps.clickOnMenuImport();
        BaseSteps.validateUrl('/import');

        // Create repository
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Repositories view to create a repository.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Setup menu.');
        MainMenuSteps.clickOnMenuSetup();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Repositories menu.');
        MainMenuSteps.clickOnRepositoriesSubmenu();
        BaseSteps.validateUrl('/repository');

        // Class hierarchy
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Class hierarchy view to inspect the class hierarchy and gain an insight on what the dataset contains.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
        MainMenuSteps.clickOnExplore();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Class hierarchy menu.');
        MainMenuSteps.clickOnSubmenuClassHierarchy();
        BaseSteps.validateUrl('/hierarchy');

        // Class relationships
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class relationships — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Class relationships view to explore how classes are connected and understand the relationships between different types of data in your dataset.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class relationships — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
        MainMenuSteps.clickOnExplore();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class relationships — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Class relationships menu.');
        MainMenuSteps.clickOnSubmenuClassRelationships();
        BaseSteps.validateUrl('/relationships');

        // Visual graph
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Visual graph view to explore data in a visual manner.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
        MainMenuSteps.clickOnExplore();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Visual graph menu.');
        MainMenuSteps.clickOnSubmenuVisualGraph();
        BaseSteps.validateUrl('/graphs-visualizations');

        // Similarity
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to create a Similarity index for your dataset.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
        MainMenuSteps.clickOnExplore();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Similarity menu.');
        MainMenuSteps.clickOnSubmenuSimilarity();
        BaseSteps.validateUrl('/similarity');

        // SPARQL
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 1/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the SPARQL Query & Update view to execute queries.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 2/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the SPARQL menu.');
        MainMenuSteps.clickOnSparqlMenu();
        BaseSteps.validateUrl('/sparql');

        // TTYG
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create an agent — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Talk to Your Graph view to create an agen');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create an agent — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Lab menu.');
        MainMenuSteps.clickOnMenuLab();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create an agent — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Talk to Your Graph menu.');
        MainMenuSteps.clickOnTTYGSubmenu();
        BaseSteps.validateUrl('/ttyg');

        // Autocomplete
        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Autocomplete index view to enable the autocomplete index.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Setup menu.');
        MainMenuSteps.clickOnMenuSetup();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Autocomplete menu.');
        MainMenuSteps.clickOnSubmenuAutocomplete();
        BaseSteps.validateUrl('/autocomplete');

        // Connectors
        GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors — 1/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Setup menu.');
        MainMenuSteps.clickOnMenuSetup();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors — 2/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Connectors menu.');
        MainMenuSteps.clickOnSubmenuConnectors();
        BaseSteps.validateUrl('/connectors');

        // RDF Rank
        GuideDialogSteps.assertDialogWithTitleIsVisible('RDF Rank — 1/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Setup menu.');
        MainMenuSteps.clickOnMenuSetup();

        GuideDialogSteps.assertDialogWithTitleIsVisible('RDF Rank — 2/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the RDF Rank menu.');
        MainMenuSteps.clickOnSubmenuRDFRank();
        BaseSteps.validateUrl('/rdfrank');

        GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
        GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
    });

    it('Should visit all menus with next click', () => {
        // Import
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 1/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Import view to import data from a file.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 2/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Import menu.');
        GuideDialogSteps.clickOnNextButton();
        BaseSteps.validateUrl('/import');

        // Create repository
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Repositories view to create a repository.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Setup menu.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Repositories menu.');
        GuideDialogSteps.clickOnNextButton();
        BaseSteps.validateUrl('/repository');

        // Class hierarchy
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Class hierarchy view to inspect the class hierarchy and gain an insight on what the dataset contains.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class hierarchy — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Class hierarchy menu.');
        GuideDialogSteps.clickOnNextButton();
        BaseSteps.validateUrl('/hierarchy');

        // Class relationships
        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class relationships — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Class relationships view to explore how classes are connected and understand the relationships between different types of data in your dataset.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class relationships — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Explore the class relationships — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Class relationships menu.');
        GuideDialogSteps.clickOnNextButton();
        BaseSteps.validateUrl('/relationships');

        // Visual graph
        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Visual graph view to explore data in a visual manner.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Visual graph explore — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Visual graph menu.');
        GuideDialogSteps.clickOnNextButton();
        BaseSteps.validateUrl('/graphs-visualizations');

        // Similarity
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to create a Similarity index for your dataset.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Similarity menu.');
        GuideDialogSteps.clickOnNextButton();
        BaseSteps.validateUrl('/similarity');

        // SPARQL
        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 1/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the SPARQL Query & Update view to execute queries.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Execute SPARQL query — 2/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the SPARQL menu.');
        GuideDialogSteps.clickOnNextButton();
        BaseSteps.validateUrl('/sparql');

        // TTYG
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create an agent — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Talk to Your Graph view to create an agen');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create an agent — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Lab menu.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create an agent — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Talk to Your Graph menu.');
        GuideDialogSteps.clickOnNextButton();
        BaseSteps.validateUrl('/ttyg');

        // Autocomplete
        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 1/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Autocomplete index view to enable the autocomplete index.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 2/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Setup menu.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 3/3');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Autocomplete menu.');
        GuideDialogSteps.clickOnNextButton();
        BaseSteps.validateUrl('/autocomplete');

        // Connectors
        GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors — 1/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Setup menu.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors — 2/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Connectors menu.');
        GuideDialogSteps.clickOnNextButton();
        BaseSteps.validateUrl('/connectors');

        // RDF Rank
        GuideDialogSteps.assertDialogWithTitleIsVisible('RDF Rank — 1/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Setup menu.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('RDF Rank — 2/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the RDF Rank menu.');
        GuideDialogSteps.clickOnNextButton();
        BaseSteps.validateUrl('/rdfrank');

        GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
        GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
    });
});
