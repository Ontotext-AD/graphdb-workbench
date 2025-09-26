import {NotFoundSteps} from "../../steps/not-found/not-found-steps.js";

describe('Not found page', () => {

    it('Should display the 404 not found page for an unknown route', () => {
        // Given, I navigate to an unknown route
        NotFoundSteps.visit('/unknown-route');

        // Then, I expect to see the 404 not found page
        NotFoundSteps.getNotFoundBanner().should('be.visible');
        NotFoundSteps.getNotFoundContent().should('contain', '404 That’s an error!');
        NotFoundSteps.getNotFoundContent().should('contain', 'The requested URL was not found on this server. That’s all I know.');
        NotFoundSteps.getGoHomeButton().should('be.visible');

        // When, I click on the "Go Home" button
        NotFoundSteps.clickGoHomeButton();

        // Then, I expect to be redirected to the home page
        NotFoundSteps.getUrl().should('eq', `${Cypress.config('baseUrl')}/`);
        // And the banner should no longer be visible
        NotFoundSteps.getNotFoundBanner().should('not.exist');
    });
});
