import {RepositorySteps} from 'steps/repository-steps';
import {collectAppErrors, proof, recordSideEffect, verifyRepoId} from './verify-support';

describe('verify: repositories', () => {
    const repositoryId = verifyRepoId('repo');

    after(() => cy.deleteRepository(repositoryId));

    it('creates, selects and deletes a GraphDB repository through the UI', () => {
        RepositorySteps.visit();
        proof('01-repositories-list');

        // Create via Setup > Repositories > Create new repository > GraphDB Repository
        RepositorySteps.createRepository();
        cy.url().should('include', '/repository/create');
        RepositorySteps.chooseRepositoryType('gdb');
        RepositorySteps.typeRepositoryId(repositoryId);
        proof('02-create-form-filled');
        RepositorySteps.saveRepository();
        cy.url().should((url) => expect(url.endsWith('/repository')).to.equal(true));
        RepositorySteps.getRepositoryFromList(repositoryId).should('be.visible');
        proof('03-created-in-list');

        // Side effect: the backend knows the repository
        cy.request('/rest/repositories').its('body').then((repos) => {
            const repo = repos.find((r) => r.id === repositoryId);
            expect(repo, 'repository in /rest/repositories').to.exist;
            recordSideEffect('repositories-after-create', repo);
        });

        // Select it from the header repository selector
        RepositorySteps.selectRepoFromDropdown(repositoryId);
        cy.get('.active-repository').should('contain', repositoryId);
        RepositorySteps.getRepositoryConnectionOnBtn(repositoryId).should('be.visible');
        proof('04-selected');

        // Delete from the list row and confirm. Deleting the *selected* repository used to throw
        // an uncaught "namespaces: 404" in the app (see features/repositories.md Gotchas): record it.
        const appErrors = [];
        collectAppErrors(appErrors);
        RepositorySteps.getRepositoryFromList(repositoryId)
            .find('.repository-actions .delete-repository-btn')
            .should('be.visible')
            .click({force: true});
        RepositorySteps.confirmModal();
        // not.exist, not getRepositoriesList().should('not.contain'): on an empty GraphDB the list table is
        // replaced by "There are no repositories" once the last repository is gone.
        cy.contains('#wb-repositories-repositoryInGetRepositories .repository', repositoryId).should('not.exist');
        proof('05-deleted');
        cy.request('/rest/repositories').its('body').then((repos) => {
            expect(repos.map((r) => r.id)).not.to.include(repositoryId);
            recordSideEffect('repositories-after-delete', repos.map((r) => r.id));
        });
        cy.then(() => {
            recordSideEffect('uncaught-app-errors-on-delete', appErrors);
            appErrors.forEach((msg) => expect(msg).to.match(/namespaces: 404/));
        });
    });
});
