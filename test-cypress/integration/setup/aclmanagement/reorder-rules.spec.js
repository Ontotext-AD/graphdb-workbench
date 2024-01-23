import {AclManagementSteps} from "../../../steps/setup/acl-management-steps";
import {ACL} from "../../../steps/setup/acl-management-steps";

describe('ACL Management: reorder rules', () => {

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
        // ensure rules are rendered
        AclManagementSteps.getAclRules().should('have.length.gt', 0);
    });

    it('Should move rule up', () => {
        AclManagementSteps.moveRuleUp(1);
        AclManagementSteps.checkStatementRules([ACL[1], ACL[0], ACL[2], ACL[3], ACL[4]]);
    });

    it('Should move rule down', () => {
        AclManagementSteps.moveRuleDown(1);
        AclManagementSteps.checkStatementRules([ACL[0], ACL[2], ACL[1], ACL[3], ACL[4]]);
    });
});
