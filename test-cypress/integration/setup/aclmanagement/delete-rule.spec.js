import {AclManagementSteps} from "../../../steps/setup/acl-management-steps";
import {ACL} from "../../../steps/setup/acl-management-steps";
import {ModalDialogSteps} from "../../../steps/modal-dialog-steps";

describe('ACL Management: delete rule', () => {

    let repositoryId;

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    beforeEach(() => {
        repositoryId = 'acl-management-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.initializeRepository(repositoryId);
        cy.enableAutocomplete(repositoryId);
        AclManagementSteps.importRules(repositoryId);
        AclManagementSteps.visit();
        // ensure rules are rendered
        AclManagementSteps.getAclRules().should('have.length.gt', 0);
    });

    it('Should be able to delete rule', () => {
        // When I try to remove a rule
        AclManagementSteps.getAclRules().should('have.length', 5);
        AclManagementSteps.deleteRule(0);
        // Then I expect a confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to delete the selected rule #0?');
        // When I cancel operation
        ModalDialogSteps.clickOnCancelButton();
        // Then I expect the rule to remain in the list
        ModalDialogSteps.getDialog().should('not.exist');
        AclManagementSteps.getAclRules().should('have.length', 5);
        // When I try remove it again and confirm the operation
        AclManagementSteps.deleteRule(4);
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to delete the selected rule #4?');
        ModalDialogSteps.clickOnConfirmButton();
        // Then I expect the rule to be removed from the list
        ModalDialogSteps.getDialog().should('not.exist');
        AclManagementSteps.getAclRules().should('have.length', 4);
        AclManagementSteps.checkStatementRules([ACL[0], ACL[1], ACL[2], ACL[3]]);
    });
});
