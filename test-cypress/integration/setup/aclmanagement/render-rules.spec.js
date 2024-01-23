import {AclManagementSteps} from "../../../steps/setup/acl-management-steps";
import {ACL} from "../../../steps/setup/acl-management-steps";

describe('ACL Management: render rules', () => {

    let repositoryId;

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    context('When no ACL is loaded', () => {
        beforeEach(() => {
            repositoryId = 'acl-management-' + Date.now();
            cy.createRepository({id: repositoryId});
            cy.presetRepository(repositoryId);
            cy.initializeRepository(repositoryId);
            AclManagementSteps.visit();
        });

        it('Should render empty ACL rules table', () => {
            AclManagementSteps.getPageHeading().should('contain', 'ACL Management');
            AclManagementSteps.getAclTable().should('be.visible');
            AclManagementSteps.getAclRules().should('not.exist');
            AclManagementSteps.getAddFirstRuleButton().should('be.visible');
            AclManagementSteps.getNoDataMessage().should('be.visible');
        });
    });

    context('When rules are loaded', () => {
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

        it('Should render ACL rules in a table', () => {
            AclManagementSteps.getAclRules().should('have.length', 5);
            AclManagementSteps.getAddFirstRuleButton().should('be.visible');
            AclManagementSteps.checkStatementRules(ACL);
        });
    });
});
