import {AclManagementSteps} from "../../../steps/setup/acl-management-steps";
import {ACL_VIEW} from "../../../steps/setup/acl-management-steps";
import {ApplicationSteps} from "../../../steps/application-steps";

// TODO: Fix me. Broken due to migration (Error: beforeEach)
describe.skip('ACL Management: reorder rules', () => {

    let repositoryId;

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    beforeEach(() => {
        repositoryId = 'acl-management-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.initializeRepository(repositoryId);
        AclManagementSteps.importRules(repositoryId);
        AclManagementSteps.visit();
        ApplicationSteps.geLoader().should('not.exist');
        // ensure rules are rendered
        AclManagementSteps.getAclRules().should('have.length.gt', 0);
    });

    it('Should move rule up', () => {
        AclManagementSteps.moveRuleUp(1);
        AclManagementSteps.checkStatementRules([ACL_VIEW[1], ACL_VIEW[0], ACL_VIEW[2], ACL_VIEW[3], ACL_VIEW[4]]);
    });

    it('Should move rule down', () => {
        AclManagementSteps.moveRuleDown(1);
        AclManagementSteps.checkStatementRules([ACL_VIEW[0], ACL_VIEW[2], ACL_VIEW[1], ACL_VIEW[3], ACL_VIEW[4]]);
    });
});
