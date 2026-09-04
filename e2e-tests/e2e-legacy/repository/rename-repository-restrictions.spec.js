import {RepositorySteps} from "../../steps/repository-steps";
import {OntopRepositorySteps} from "../../steps/ontop-repository-steps";
import {ToasterSteps} from "../../steps/toaster-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {RepositoriesStubs} from '../../stubs/repositories/repositories-stubs.js';

describe('Repository rename restrictions', () => {

    let repositoryId;
    let memberRepositoryId;

    beforeEach(() => {
        repositoryId = 'repo-' + Date.now();
        memberRepositoryId = 'member-' + Date.now();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
        cy.deleteRepository(memberRepositoryId);
    });

    it('should allow renaming of a GraphDB repository', () => {
        // Given there is a GraphDB repository.
        cy.createRepository({id: repositoryId});

        // When I open its edit page.
        RepositorySteps.visitEditPage(repositoryId);

        // Then the repository id should be rendered as read only,
        RepositorySteps.getGDBIdInput()
            .should('have.value', repositoryId)
            .and('be.disabled');
        // and the action which unlocks the repository id field should be available.
        RepositorySteps.getRepositoryIdEditElement().should('be.visible');
    });

    it('should not allow renaming of an Ontop repository', () => {
        RepositoriesStubs.spyGetRepository(repositoryId);
        // Given there is an Ontop repository.
        createOntopRepository(repositoryId);

        // When I open its edit page.
        RepositorySteps.visit();
        RepositorySteps.editRepository(repositoryId);
        cy.wait('@getRepository');
        // Then the repository id should be rendered as read only,
        RepositorySteps.getGDBIdInput()
            .should('have.value', repositoryId)
            .and('be.disabled');
        // and the action which unlocks the repository id field should not be available, because
        // renaming is allowed only for GraphDB repositories.
        RepositorySteps.getRepositoryIdEditElement().should('not.exist');

        // When the repository id is changed despite the field being disabled,
        forceChangeRepositoryId('renamed-' + repositoryId);
        // and I try to save the configuration.
        RepositorySteps.clickSaveEditedRepo();

        // Then I expect to see an error message,
        ToasterSteps.verifyError('Can not change the name of ontop repository');
        // and the repository should keep its original id.
        RepositorySteps.visit();
        RepositorySteps.getRepositoryFromList(repositoryId).should('be.visible');
    });

    it('should not allow renaming of a FedX repository', () => {
        RepositoriesStubs.spyGetRepository(repositoryId);
        // Given there is a FedX repository.
        cy.createRepository({id: memberRepositoryId});
        createFedxRepository(repositoryId, memberRepositoryId);

        // When I open its edit page.
        RepositorySteps.visit();
        RepositorySteps.editRepository(repositoryId);
        cy.wait('@getRepository');

        // Then the repository id should be rendered as read only,
        RepositorySteps.getGDBIdInput()
            .should('have.value', repositoryId)
            .and('be.disabled');
        // and the action which unlocks the repository id field should not be available, because
        // renaming is allowed only for GraphDB repositories.
        RepositorySteps.getRepositoryIdEditElement().should('not.exist');

        // When I save the configuration.
        RepositorySteps.getSaveRepositoryButton().click();
        ModalDialogSteps.clickOnConfirmButton();

        // Then the repository should keep its original id.
        RepositorySteps.visit();
        RepositorySteps.getRepositoryFromList(repositoryId).should('be.visible');
    });

    /**
     * Changes the repository id field although it is disabled in order to verify that the restriction is
     * enforced by the controller too and not only by the view.
     *
     * @param {string} newRepositoryId The new repository id.
     */
    const forceChangeRepositoryId = (newRepositoryId) => {
        RepositorySteps.getGDBIdInput()
            .clear({force: true})
            .type(newRepositoryId, {force: true})
            .should('have.value', newRepositoryId);
    };

    const createOntopRepository = (repositoryId) => {
        OntopRepositorySteps.visitCreate();
        RepositorySteps.typeRepositoryId(repositoryId);
        OntopRepositorySteps.selectOracleDatabase();
        OntopRepositorySteps.typeHostName('localhost');
        OntopRepositorySteps.typePort(5423);
        OntopRepositorySteps.typeDatabaseName('database-name');
        OntopRepositorySteps.clickObdaFileUploadButton();
        OntopRepositorySteps.uploadObdaFile('fixtures/ontop/university-complete.obda');
        // Wait the OBDA edit button to become visible to ensure that the file is uploaded.
        OntopRepositorySteps.getOBDAFileFieldEditButton().should('be.visible');
        OntopRepositorySteps.clickOnCreateRepositoryButton();
    };

    const createFedxRepository = (repositoryId, memberRepositoryId) => {
        RepositorySteps.visit();
        RepositorySteps.createRepository();
        RepositorySteps.createFedexRepositoryType();
        RepositorySteps.typeRepositoryId(repositoryId);
        RepositorySteps.selectFedexMember(memberRepositoryId);
        RepositorySteps.saveRepository();
    };
});
