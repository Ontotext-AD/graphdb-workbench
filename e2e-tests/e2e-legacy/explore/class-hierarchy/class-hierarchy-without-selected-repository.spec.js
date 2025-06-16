import {MainMenuSteps} from "../../../steps/main-menu-steps";
import HomeSteps from "../../../steps/home-steps";
import {RepositoryErrorsWidgetSteps} from "../../../steps/widgets/repository-errors-widget-steps";
import ClassViewsSteps from "../../../steps/class-views-steps";

describe('Initial state of the Class hierarchy view without a selected repository', () => {

    it('Should display the correct initial state when navigating via URL', () => {
        // When: I visit the Class hierarchy page via URL without a repository selected
        ClassViewsSteps.visit();
        // Then:
        verifyInitialStateWithoutSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // When: I visit the Class hierarchy page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnClassHierarchy();
        // Then:
        verifyInitialStateWithoutSelectedRepository();
    });

    const verifyInitialStateWithoutSelectedRepository = () => {
        RepositoryErrorsWidgetSteps.getWidget().should('be.visible');
        ClassViewsSteps.getNoHierarchyErrorElement().should('be.hidden');
        ClassViewsSteps.getToolbarHolder().should('be.hidden');
        ClassViewsSteps.getSlider().should('be.hidden');
        ClassViewsSteps.getRDFClassHierarchy().should('be.hidden');
    };
});
