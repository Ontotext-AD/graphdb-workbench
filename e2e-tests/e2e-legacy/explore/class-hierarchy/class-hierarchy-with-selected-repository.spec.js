import {MainMenuSteps} from "../../../steps/main-menu-steps";
import HomeSteps from "../../../steps/home-steps";
import {RepositoryErrorsWidgetSteps} from "../../../steps/widgets/repository-errors-widget-steps";
import ClassViewsSteps from "../../../steps/class-views-steps";

describe('Initial state of the Class hierarchy view with a selected repository', () => {
    const FILE_TO_IMPORT = 'wine.rdf';
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'class-hierarchy-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // When: I visit the Class hierarchy page via URL with a repository selected
        ClassViewsSteps.visit();
        // Then:
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // When: I visit the Class hierarchy page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnClassHierarchy();
        // Then:
        verifyInitialStateWithSelectedRepository();
    });

    const verifyInitialStateWithSelectedRepository = () => {
        RepositoryErrorsWidgetSteps.getWidget().should('be.hidden');
        ClassViewsSteps.getNoHierarchyErrorElement().should('be.hidden');
        ClassViewsSteps.getToolbarHolder().should('be.visible');
        ClassViewsSteps.getSlider().should('be.visible');
        ClassViewsSteps.getRDFClassHierarchy().should('be.visible');
    };
});
