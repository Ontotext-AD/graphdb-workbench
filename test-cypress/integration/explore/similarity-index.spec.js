import {SimilarityIndexCreateSteps} from "../../steps/explore/similarity-index-create-steps";
import {RepositorySelectorSteps} from "../../steps/repository-selector-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import {ModalDialogSteps, VerifyConfirmationDialogOptions} from "../../steps/modal-dialog-steps";
import {SimilarityIndexesSteps} from "../../steps/explore/similarity-indexes-steps";

const FILE_TO_IMPORT = 'people.zip';

describe('Confirmations when try to change repository', () => {

    let secondRepositoryId;
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'similarity-index-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        secondRepositoryId = 'create-similarity-index-second-repo' + Date.now();
        cy.createRepository({id: secondRepositoryId});
        SimilarityIndexCreateSteps.visit();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
        cy.deleteRepository(secondRepositoryId);
    });

    it('should not display confirm message if create similarity form is dirty and try to change repository', () => {
        // Given I opened the create similarity view,
        // and create similarity form is dirty.
        SimilarityIndexCreateSteps.typeSimilarityIndexName('index name');

        // When I change the  repository.
        RepositorySelectorSteps.selectRepository(secondRepositoryId);
        // Then I expect to not be redirected to similarity indexes view.
        SimilarityIndexCreateSteps.verifyUrl();
    });

    it('should display confirm message if edit similarity create form is dirty (Search query changed) and try to change repository', () => {
        const similarityIndexName = 'SimilarityIndex';
        YasqeSteps.waitUntilQueryIsVisible();
        SimilarityIndexCreateSteps.typeSimilarityIndexName(similarityIndexName);
        SimilarityIndexCreateSteps.create();
        SimilarityIndexesSteps.getEditButton(similarityIndexName).click();

        // Given I opened the edit similarity view,
        // During the initialization query is changed and this broke the test.
        // Most the time the broken flow is:
        // 1.   cypress start to type 's';
        // 2.   query is changed
        // 3.   cypress continuous to type 'ome changes'.
        // as result query is 'ome changes<data query>. YasqeSteps.writeInEditor function has check if parameter is filled, in our case 'some changes',
        // and this broke the test. Add a little wait time to give chance yasqe query to be filled.
        cy.wait(1000);
        // and change "Search query".
        YasqeSteps.writeInEditor('some changes');

        // When I try to change repository.
        // Then I expect to be asked for confirmation to be redirected to similarity indexes view.
        ModalDialogSteps.verifyUrlChangedConfirmation(createVerifyConfirmationDialogOptions());
    });

    it('should display confirm message if edit similarity create form is dirty (Analogical query changed) and try to change repository', () => {
        // Given I opened the edit similarity view,
        const similarityIndexName = 'SimilarityIndex';
        YasqeSteps.waitUntilQueryIsVisible();
        SimilarityIndexCreateSteps.typeSimilarityIndexName(similarityIndexName);
        SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
        SimilarityIndexCreateSteps.create();
        SimilarityIndexesSteps.getEditButton(similarityIndexName).click();
        // and change "Analogical query".
        SimilarityIndexCreateSteps.switchToAnalogicalQueryTab();
        YasqeSteps.writeInEditor('some changes');

        // When I try to change repository.
        // Then I expect to be asked for confirmation to be redirected to similarity indexes view.
        ModalDialogSteps.verifyUrlChangedConfirmation(createVerifyConfirmationDialogOptions());
    });

    function createVerifyConfirmationDialogOptions() {
        return new VerifyConfirmationDialogOptions()
            .setChangePageFunction(() => RepositorySelectorSteps.selectRepository(secondRepositoryId))
            .setConfirmationMessage('You have unsaved changes. Are you sure that you want to exit?')
            .setVerifyCurrentUrl(() => cy.url().should('include', `${Cypress.config('baseUrl')}/similarity/index/create`))
            .setVerifyRedirectedUrl(() => cy.url().should('eq', `${Cypress.config('baseUrl')}/similarity`));
    }
});
