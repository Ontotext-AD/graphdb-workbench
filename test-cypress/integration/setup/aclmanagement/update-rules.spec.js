import {ACL_VIEW, AclManagementSteps} from "../../../steps/setup/acl-management-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {ModalDialogSteps} from "../../../steps/modal-dialog-steps";

describe('ACL Management: update rules', () => {

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
        ApplicationSteps.geLoader().should('not.exist');
        // ensure rules are rendered
        AclManagementSteps.getAclRules().should('have.length.gt', 0);
    });

    it('Should be able to edit and save ACL', () => {
        // Given I have opened ACL management page
        AclManagementSteps.checkStatementRules(ACL_VIEW);
        // When I add a new rule
        AclManagementSteps.addRule(1);
        AclManagementSteps.fillSubject(2, '<urn:John>');
        AclManagementSteps.fillPredicate(2, '*');
        AclManagementSteps.fillObject(2, '*');
        AclManagementSteps.fillContext(2, '*');
        AclManagementSteps.fillRole(2, 'ROLE1');
        AclManagementSteps.selectPolicy(2, 'deny');
        AclManagementSteps.selectOperation(2, 'write');
        AclManagementSteps.saveRule(2);
        // And I edit an existing rule
        AclManagementSteps.editRule(1);
        AclManagementSteps.fillSubject(1, '<urn:Me>');
        AclManagementSteps.fillPredicate(1, '*');
        AclManagementSteps.fillObject(1, '*');
        AclManagementSteps.fillContext(1, '*');
        AclManagementSteps.fillRole(1, 'TEST');
        AclManagementSteps.selectPolicy(1, 'allow');
        AclManagementSteps.selectOperation(1, 'write');
        AclManagementSteps.saveRule(1);
        // And I delete an existing rule
        AclManagementSteps.deleteRule(5);
        ModalDialogSteps.clickOnConfirmButton();
        // And I save the ACL list
        AclManagementSteps.saveAcl();
        ApplicationSteps.geLoader().should('not.exist');
        // Then I expect the ACL to be saved
        ApplicationSteps.getSuccessNotifications().should('be.visible');
        AclManagementSteps.getAclRules().should('have.length', 5);
        const editedRule = {
            "scope": "statement",
            "policy": "deny",
            "role": "ROLE1",
            "operation": "write",
            "subject": "<urn:John>",
            "predicate": "*",
            "object": "*",
            "context": "*",
            "moveUp": true,
            "moveDown": true
        };
        const newRule = {
            "scope": "statement",
            "policy": "allow",
            "role": "TEST",
            "operation": "write",
            "subject": "<urn:Me>",
            "predicate": "*",
            "object": "*",
            "context": "*",
            "moveUp": true,
            "moveDown": true
        };
        AclManagementSteps.checkStatementRules([ACL_VIEW[0], newRule, editedRule, ACL_VIEW[2], ACL_VIEW[3]]);
    });

    it('Should prevent leaving the page when there is new rule added', () => {
        // Given I have opened ACL management page
        // When I don't change anything and try to leave the page
        ApplicationSteps.openImportPage();
        // Then I expect to be redirected to the new page without confirmation
        cy.url().should('contain', '/import');
        // When I add a new rule
        AclManagementSteps.visit();
        AclManagementSteps.addRule(1);
        ApplicationSteps.openImportPage();
        // Then I expect a confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // When I cancel confirmation
        ModalDialogSteps.clickOnCancelButton();
        // Then I expect dialog to be closed and to stay on the current page
        ModalDialogSteps.getDialog().should('not.exist');
        cy.url().should('contain', '/aclmanagement');
        // When I try to leave the page and I confirm the operation
        ApplicationSteps.openImportPage();
        ModalDialogSteps.clickOnConfirmButton();
        // Then I expect to be redirected to the new page
        cy.url().should('contain', '/import');
    });

    it('Should prevent leaving the page when there is an edited rule', () => {
        // Given I have opened ACL management page
        // When I edit a rule
        AclManagementSteps.editRule(1);
        AclManagementSteps.fillSubject(1, '<urn:Me>');
        AclManagementSteps.saveRule(1);
        // And I try to leave the page
        ApplicationSteps.openImportPage();
        // Then I expect a confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
    });

    it('Should prevent leaving the page when there is a deleted rule', () => {
        // Given I have opened ACL management page
        // When I delete a rule
        AclManagementSteps.deleteRule(1);
        ModalDialogSteps.clickOnConfirmButton();
        // And I try to leave the page
        ApplicationSteps.openImportPage();
        // Then I expect a confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
    });

    it('Should prevent leaving the page when there is a moved rule', () => {
        // Given I have opened ACL management page
        // When I move a rule
        AclManagementSteps.moveRuleDown(1);
        // And I try to leave the page
        ApplicationSteps.openImportPage();
        // Then I expect a confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
    });
});
