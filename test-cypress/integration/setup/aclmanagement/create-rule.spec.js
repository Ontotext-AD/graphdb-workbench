import {AclManagementSteps} from "../../../steps/setup/acl-management-steps";
import {ACL_VIEW} from "../../../steps/setup/acl-management-steps";
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
        cy.enableAutocomplete(repositoryId);
        AclManagementSteps.importRules(repositoryId);
        AclManagementSteps.visit();
        ApplicationSteps.geLoader().should('not.exist');
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
        // When I fill in the role field
        AclManagementSteps.getRoleField(2).should('have.value', '');
        AclManagementSteps.fillRole(2, 'ROLE1');
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
        // Then I expect that the save rule button should be enabled
        AclManagementSteps.checkIfRuleSavingIsAllowed(2);
        // When I change the policy
        AclManagementSteps.selectPolicy(2, 'deny');
        // Then I expect that the save rule button should be enabled
        AclManagementSteps.checkIfRuleSavingIsAllowed(2);
        // When I change the operation
        AclManagementSteps.selectOperation(2, 'write');
        // Then I expect that the save rule button should be enabled
        AclManagementSteps.checkIfRuleSavingIsAllowed(2);
        // When I save the rule
        AclManagementSteps.saveRule(2);
        // Then the rule should be saved
        AclManagementSteps.getAclRules().should('have.length', 6);
        const newRule = {
            "scope": "statement",
            "policy": "deny",
            "role": "ROLE1",
            "subject": "<urn:John>",
            "predicate": "*",
            "object": "*",
            "context": "*",
            "operation": "write",
            "moveUp": true,
            "moveDown": true
        };
        AclManagementSteps.checkStatementRules([ACL_VIEW[0], ACL_VIEW[1], newRule, ACL_VIEW[2], ACL_VIEW[3], ACL_VIEW[4]]);

        cy.intercept('PUT', '/rest/repositories/acl-management-*/acl').as('putCall');
        // When I save the rules
        AclManagementSteps.saveAcl();
        // Then wait for the PUT call to occur and assert the request body
        cy.wait('@putCall').then((interception) => {
            const expected = [
                {
                    "scope": "statement",
                    "policy": "allow",
                    "role": "!CUSTOM_ROLE2",
                    "operation": "write",
                    "subject": "<urn:Mary>",
                    "predicate": "*",
                    "object": "*",
                    "context": "*"
                },
                {
                    "scope": "statement",
                    "policy": "deny",
                    "role": "CUSTOM_ROLE1",
                    "operation": "read",
                    "subject": "*",
                    "predicate": "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>",
                    "object": "*",
                    "context": "*"
                },
                {
                    "scope": "statement",
                    "policy": "deny",
                    "role": "CUSTOM_ROLE1",
                    "operation": "write",
                    "subject": "<urn:John>",
                    "predicate": "*",
                    "object": "*",
                    "context": "*"
                },
                {
                    "scope": "statement",
                    "policy": "deny",
                    "role": "CUSTOM_ROLE3",
                    "operation": "read",
                    "subject": "<<<http://example.com/test> <http://www.w3.org/2000/01/rdf-schema#label> \"test aber auf Deutsch\"@de>>",
                    "predicate": "*",
                    "object": "\"test aber auf Deutsch\"@en",
                    "context": "<http://example.com/graph1>"
                },
                {
                    "scope": "statement",
                    "policy": "allow",
                    "role": "CUSTOM_ROLE3",
                    "operation": "write",
                    "subject": "*",
                    "predicate": "*",
                    "object": "\"15\"^^<http://www.w3.org/2001/XMLSchema#int>",
                    "context": "*"
                },
                {
                    "scope": "statement",
                    "policy": "deny",
                    "role": "CUSTOM_ROLE4",
                    "operation": "write",
                    "subject": "<urn:Cat>",
                    "predicate": "*",
                    "object": "<<<http://example.com/test> <http://www.w3.org/2000/01/rdf-schema#label> \"test aber auf Deutsch\"@de>>",
                    "context": "*"
                }
            ];
            expect(interception.request.body).to.deep.eq(expected);
        });
    });

    it('Should hide all unnecessary actions during rule creation', () => {
        // When there is no rule opened for edit
        // Then I expect that move up, move down, edit rule, create rule, delete rule buttons to be visible
        AclManagementSteps.getMoveUpButtons().should('have.length', 4);
        AclManagementSteps.getMoveDownButtons().should('have.length', 4);
        AclManagementSteps.deleteRuleButtons().should('have.length', 5);
        AclManagementSteps.editRuleButtons().should('have.length', 5);
        AclManagementSteps.createRuleButtons().should('have.length', 5);
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
        AclManagementSteps.selectPolicy(0, 'allow');
        AclManagementSteps.fillRole(0, '!ROLE2');
        AclManagementSteps.selectOperation(0, 'write');
        AclManagementSteps.fillSubject(0, '<urn:Mary>');
        AclManagementSteps.fillPredicate(0, '*');
        AclManagementSteps.fillObject(0, '*');
        AclManagementSteps.fillContext(0, '*');
        // and try to save it.
        AclManagementSteps.saveRule(0);

        // Then I expect an error notification to be displayed that describe me that ACL have to be unique.
        ApplicationSteps.getErrorNotifications().contains('Every ACL rule should be unique.');
    });

    it('should not allow creating a new rule if CUSTOM ROLE is less than 2 symbols', () => {
        // When I am on "ACL Management" page and create a new rule with a CUSTOM ROLE of 1 symbol
        AclManagementSteps.addRuleInBeginning();
        AclManagementSteps.selectPolicy(0, 'allow');
        AclManagementSteps.fillRole(0, 'A');
        AclManagementSteps.selectOperation(0, 'write');
        AclManagementSteps.fillSubject(0, '<urn:Mary>');
        AclManagementSteps.fillPredicate(0, '*');
        AclManagementSteps.fillObject(0, '*');
        AclManagementSteps.fillContext(0, '*');

        // Then I expect an error notification to be displayed that tells me this ROLE length is not allowed
        AclManagementSteps.getFieldError().contains('Too short');
    });

    it('should show message if role prefix is CUSTOM_', () => {
        // When I am on "ACL Management" page and create a new rule with a CUSTOM_ prefix
        AclManagementSteps.addRuleInBeginning();
        AclManagementSteps.selectPolicy(0, 'allow');
        AclManagementSteps.fillRole(0, 'CUSTOM_ROLE_FOO');

        // Then I expect the prefix warning to appear
        AclManagementSteps.getPrefixWarning().should('be.visible');
        AclManagementSteps.getPrefixWarning().should('contain.text', 'Custom roles should be entered without the "CUSTOM_" prefix in Workbench');
        // When I save the rule
        AclManagementSteps.saveRule(0);
        // Then the text should be how the user typed it
        AclManagementSteps.getSavedRoleField(0).should('contain', 'CUSTOM_ROLE_FOO');
        // And I expect a warning icon to appear
        AclManagementSteps.getWarningIcon().should('be.visible');
        AclManagementSteps.mouseoverWarningIcon();
        // And the icon should have the same tooltip text as the warning
        AclManagementSteps.getWarningIconTooltipText().should('be.visible').and('contain.text', 'Custom roles should be entered without the "CUSTOM_" prefix in Workbench');
    });
});

