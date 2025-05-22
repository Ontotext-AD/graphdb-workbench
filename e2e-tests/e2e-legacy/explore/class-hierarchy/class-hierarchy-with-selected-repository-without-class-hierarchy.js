import {MainMenuSteps} from "../../../steps/main-menu-steps";
import HomeSteps from "../../../steps/home-steps";
import {RepositoryErrorsWidgetSteps} from "../../../steps/widgets/repository-errors-widget-steps";
import ClassViewsSteps from "../../../steps/class-views-steps";

describe('Initial state of the Class hierarchy view with a selected repository and without class hierarchy', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'class-hierarchy-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // When: I visit the Class hierarchy page via URL with a repository selected and without class hierarchy
        ClassViewsSteps.visit();
        // Then:
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // When: I visit the Class hierarchy page via the navigation menu with a repository selected and without class hierarchy
        HomeSteps.visit();
        MainMenuSteps.clickOnClassHierarchy();
        // Then:
        verifyInitialStateWithSelectedRepository();
    });

    const verifyInitialStateWithSelectedRepository = () => {
        RepositoryErrorsWidgetSteps.getWidget().should('be.hidden');
        ClassViewsSteps.getNoHierarchyErrorElement().should('be.visible');
        ClassViewsSteps.getToolbarHolder().should('be.hidden');
        ClassViewsSteps.getSlider().should('be.hidden');
        ClassViewsSteps.getRDFClassHierarchy().should('be.hidden');
    };
});
