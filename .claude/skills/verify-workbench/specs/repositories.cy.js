import {RepositorySteps} from 'steps/repository-steps';
import {AttachRepositorySteps} from 'steps/repositories/attach-repository-steps';
import {collectAppErrors, proof, recordSideEffect, verifyRepoId} from './verify-support';

describe('verify: repositories', () => {
    const repositoryId = verifyRepoId('repo');
    const rulesetRepositoryId = verifyRepoId('rules');
    // The stack's GraphDB attaches itself: in a container and on the dev stack it listens on localhost:7200.
    const REMOTE_LOCATION = 'http://localhost:7200';

    after(() => {
        cy.deleteRepository(repositoryId);
        cy.deleteRepository(rulesetRepositoryId);
        cy.deleteRemoteLocation(REMOTE_LOCATION);
    });

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

    it('creates a repository with a ruleset and SHACL, then edits its title', () => {
        RepositorySteps.visit();
        RepositorySteps.createRepository();
        RepositorySteps.chooseRepositoryType('gdb');
        RepositorySteps.typeRepositoryId(rulesetRepositoryId);
        RepositorySteps.selectRuleset('OWL-Horst (Optimized)');
        RepositorySteps.verifySelectedRuleset('OWL-Horst (Optimized)');
        // The SHACL options section exists only once "Enable SHACL validation" is checked.
        cy.get('#shaclOptions').should('not.exist');
        RepositorySteps.getSHACLRepositoryCheckbox().check();
        cy.contains('button', 'SHACL options').click();
        cy.get('#shaclOptions #cacheSelectNodes').scrollIntoView().should('be.visible');
        proof('06-create-ruleset-shacl');
        RepositorySteps.saveRepository();
        RepositorySteps.getRepositoryFromList(rulesetRepositoryId).should('be.visible');
        cy.request(`/rest/repositories/${rulesetRepositoryId}`).its('body').then((config) => {
            expect(config.params.ruleset.value).to.equal('owl-horst-optimized');
            expect(config.params.isShacl.value).to.equal('true');
            recordSideEffect('ruleset-repository-after-create', config.params);
        });

        // Edit: ruleset and SHACL are fixed after creation; the title can change.
        RepositorySteps.editRepository(rulesetRepositoryId);
        cy.url().should('include', `/repository/edit/${rulesetRepositoryId}`);
        RepositorySteps.verifySelectedRuleset('OWL-Horst (Optimized)');
        RepositorySteps.getRepositoryRulesetMenu().should('be.disabled');
        RepositorySteps.getSHACLRepositoryCheckbox().should('be.checked').and('be.disabled');
        RepositorySteps.typeRepositoryTitle('edited by verify-workbench');
        proof('07-edit-form');
        RepositorySteps.saveRepository();
        RepositorySteps.confirmModal();
        cy.location('pathname').should('eq', '/repository');
        RepositorySteps.getRepositoryFromList(rulesetRepositoryId).should('be.visible');
        proof('08-edited-in-list');
        cy.request(`/rest/repositories/${rulesetRepositoryId}`).its('body').then((config) => {
            expect(config.title).to.equal('edited by verify-workbench');
            expect(config.params.ruleset.value).to.equal('owl-horst-optimized');
            recordSideEffect('ruleset-repository-after-edit', {title: config.title, params: config.params});
        });
    });

    it('attaches the stack itself as a remote GraphDB location and detaches it', () => {
        RepositorySteps.visit();
        AttachRepositorySteps.openAttachRemoteLocationDialog();
        AttachRepositorySteps.getGraphDBRadioBtn().should('be.checked');
        AttachRepositorySteps.enterURL(REMOTE_LOCATION);
        proof('09-attach-dialog');
        AttachRepositorySteps.attachRemoteLocation();
        cy.get('#wb-locations-locationInGetRemoteLocations')
            .should('be.visible')
            .and('contain', REMOTE_LOCATION);
        proof('10-remote-location-attached');
        cy.request('/rest/locations').its('body').then((locations) => {
            const location = locations.find((l) => l.uri === REMOTE_LOCATION);
            expect(location, 'location in /rest/locations').to.exist;
            recordSideEffect('locations-after-attach', locations);
        });

        cy.get(`#wb-locations-locationInGetRemoteLocations button[aria-label="Detach location Remote (${REMOTE_LOCATION})"]`)
            .click();
        RepositorySteps.confirmModal();
        cy.get('#wb-locations-locationInGetRemoteLocations').should('not.exist');
        proof('11-remote-location-detached');
        cy.request('/rest/locations').its('body').then((locations) => {
            expect(locations.map((l) => l.uri)).not.to.include(REMOTE_LOCATION);
            recordSideEffect('locations-after-detach', locations.map((l) => l.uri));
        });
    });
});
