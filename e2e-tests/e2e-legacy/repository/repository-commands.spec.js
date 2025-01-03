import {REPOSITORIES_URL} from '../../support/repository-commands';

/**
 * Tests the programmatic creation and deletion of repositories via REST calls.
 */
describe('Repository commands test', () => {

    let repoId;
    beforeEach(() => {
        repoId = 'repo-' + Date.now();
    });

    it('should create repository via REST call', () => {
        cy.createRepository({
            id: repoId,
            params: {
                ruleset: {
                    value: 'owl-horst-optimized'
                }
            }
        });

        cy.request({
            method: 'GET',
            url: REPOSITORIES_URL + '/' + repoId,
            headers: {
                'Accept': 'application/json'
            }
        }).should((response) => {
            expect(response.status).to.equal(200); // 200 OK
            expect(response.body.id).to.equal(repoId);
            expect(response.body.params.ruleset.value).to.equal('owl-horst-optimized');
        });
        cy.deleteRepository(repoId);
    });

    it('should delete repository via REST call', () => {
        cy.createRepository({id: repoId});
        cy.deleteRepository(repoId);

        cy.request({
            method: 'HEAD',
            url: REPOSITORIES_URL + '/' + repoId,
            failOnStatusCode: false
        }).should((response) => expect(response.status).to.equal(404));
    });
});
