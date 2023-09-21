import {ACL, AclManagementSteps} from "../../../steps/setup/acl-management-steps";
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
        AclManagementSteps.importRules(repositoryId);
        AclManagementSteps.visit();
        // ensure rules are rendered
        AclManagementSteps.getAclRules().should('have.length.gt', 0);
    });

    it('Should be able to edit and save ACL', () => {
        // Given I have opened ACL management page
        AclManagementSteps.checkRules(ACL);
        // When I add a new rule
        AclManagementSteps.addRule(1);
        AclManagementSteps.fillSubject(2, '<urn:John>');
        AclManagementSteps.fillPredicate(2, '*');
        AclManagementSteps.fillObject(2, '*');
        AclManagementSteps.fillContext(2, '*');
        AclManagementSteps.fillRole(2, 'CUSTOM_ROLE1');
        AclManagementSteps.selectPolicy(2, 'deny');
        AclManagementSteps.saveRule(2);
        // And I edit an existing rule
        AclManagementSteps.editRule(1);
        AclManagementSteps.fillSubject(1, '<urn:Me>');
        AclManagementSteps.fillPredicate(1, '*');
        AclManagementSteps.fillObject(1, '*');
        AclManagementSteps.fillContext(1, '*');
        AclManagementSteps.fillRole(1, 'CUSTOM_TEST');
        AclManagementSteps.selectPolicy(1, 'allow');
        AclManagementSteps.saveRule(1);
        // And I delete an existing rule
        AclManagementSteps.deleteRule(5);
        ModalDialogSteps.clickOnConfirmButton();
        // And I save the ACL list
        AclManagementSteps.saveAcl();
        // Then I expect the ACL to be saved
        ApplicationSteps.getSuccessNotifications().should('be.visible');
        AclManagementSteps.getAclRules().should('have.length', 5);
        const editedRule = {
            "subject": "<urn:John>",
            "predicate": "*",
            "object": "*",
            "context": "*",
            "role": "CUSTOM_ROLE1",
            "policy": "deny",
            "moveUp": true,
            "moveDown": true
        };
        const newRule = {
            "subject": "<urn:Me>",
            "predicate": "*",
            "object": "*",
            "context": "*",
            "role": "CUSTOM_TEST",
            "policy": "allow",
            "moveUp": true,
            "moveDown": true
        };
        AclManagementSteps.checkRules([ACL[0], newRule, editedRule, ACL[2], ACL[3]]);
    });
});
