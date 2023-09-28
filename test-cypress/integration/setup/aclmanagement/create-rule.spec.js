import {AclManagementSteps} from "../../../steps/setup/acl-management-steps";
import {ACL} from "../../../steps/setup/acl-management-steps";
import {ToasterSteps} from "../../../steps/toaster-steps";
import {ApplicationSteps} from "../../../steps/application-steps";

describe('ACL Management: create rule', () => {

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


    it('Should add a new rule in the beginning of the list and cancel operation', () => {
        AclManagementSteps.addRuleInBeginning();
        AclManagementSteps.getAclRules().should('have.length', 6);
        AclManagementSteps.cancelRuleEditing(0);
        AclManagementSteps.getAclRules().should('have.length', 5);
    });

    it('Should add a new rule in the list and cancel operation', () => {
        AclManagementSteps.addRule(1);
        AclManagementSteps.getAclRules().should('have.length', 6);
        AclManagementSteps.cancelRuleEditing(2);
        AclManagementSteps.getAclRules().should('have.length', 5);
    });

    it('Should add a new rule in the list', () => {
        // When I add a new rule
        AclManagementSteps.addRule(1);
        // Then I expect that the save rule button should be enabled because all fields have some default values
        AclManagementSteps.checkIfRuleSavingIsAllowed(2);
        // When I fill in the subject field
        AclManagementSteps.getSubjectField(2).should('have.value', '*');
        AclManagementSteps.fillSubject(2, '<urn:John>');
        // Then I expect that the save rule button should still be enabled
        AclManagementSteps.checkIfRuleSavingIsAllowed(2);
        // When I fill in the predicate field
        AclManagementSteps.getPredicateField(2).should('have.value', '*');
        AclManagementSteps.fillPredicate(2, '*');
        // Then I expect that the save rule button should still be enabled
        AclManagementSteps.checkIfRuleSavingIsAllowed(2);
        // When I fill in the object field
        AclManagementSteps.getObjectField(2).should('have.value', '*');
        AclManagementSteps.fillObject(2, '*');
        // Then I expect that the save rule button should still be enabled
        AclManagementSteps.checkIfRuleSavingIsAllowed(2);
        // When I fill in the context field
        AclManagementSteps.getContextField(2).should('have.value', '*');
        AclManagementSteps.fillContext(2, '*');
        // Then I expect that the save rule button should be enabled
        AclManagementSteps.checkIfRuleSavingIsAllowed(2);
        // When I fill in the role field
        AclManagementSteps.getRoleField(2).should('have.value', 'CUSTOM_');
        AclManagementSteps.fillRole(2, 'CUSTOM_ROLE1');
        // Then I expect that the save rule button should be enabled
        AclManagementSteps.checkIfRuleSavingIsAllowed(2);
        // When I change the policy
        AclManagementSteps.selectPolicy(2, 'deny');
        // Then I expect that the save rule button should be enabled
        AclManagementSteps.checkIfRuleSavingIsAllowed(2);
        // When I save the rule
        AclManagementSteps.saveRule(2);
        // Then the rule should be saved
        AclManagementSteps.getAclRules().should('have.length', 6);
        const newRule = {
            "subject": "<urn:John>",
            "predicate": "*",
            "object": "*",
            "context": "*",
            "role": "CUSTOM_ROLE1",
            "policy": "deny",
            "moveUp": true,
            "moveDown": true
        };
        AclManagementSteps.checkRules([ACL[0], ACL[1], newRule, ACL[2], ACL[3], ACL[4]]);
    });

    it('Should hide all unnecessary actions during rule creation', () => {
        // When there is no rule opened for edit
        // Then I expect that move up, move down, edit rule, create rule, delete rule buttons to be visible
        AclManagementSteps.getMoveUpButtons().should('have.length', 4);
        AclManagementSteps.getMoveDownButtons().should('have.length', 4);
        AclManagementSteps.deleteRuleButtons().should('have.length', 5);
        AclManagementSteps.editRuleButtons().should('have.length', 5);
        AclManagementSteps.createRuleButtons().should('have.length', 6);
        // When a rule is in edit mode
        AclManagementSteps.addRule(1);
        // Then I expect that move up, move down, edit rule, create rule, delete rule buttons to be hidden
        AclManagementSteps.getMoveUpButtons().should('have.length', 0);
        AclManagementSteps.getMoveDownButtons().should('have.length', 0);
        AclManagementSteps.deleteRuleButtons().should('have.length', 0);
        AclManagementSteps.editRuleButtons().should('have.length', 0);
        AclManagementSteps.createRuleButtons().should('have.length', 0);
    });

    it('should not allow creating of a new rule if it is not unique', () => {
        // When I am on "ACL Management" page and create a rule that exist,
        AclManagementSteps.addRuleInBeginning();
        AclManagementSteps.fillSubject(0, '<urn:Mary>');
        AclManagementSteps.fillPredicate(0, '*');
        AclManagementSteps.fillObject(0, '*');
        AclManagementSteps.fillContext(0, '*');
        AclManagementSteps.fillRole(0, '!CUSTOM_ROLE2');
        AclManagementSteps.selectPolicy(0, 'allow');
        // and try to save it.
        AclManagementSteps.saveRule(0);

        // Then I expect an error notification to be displayed that describe me that ACL have to be unique.
        ApplicationSteps.getErrorNotifications().contains('Every ACL rule should be unique.');
    });
});

