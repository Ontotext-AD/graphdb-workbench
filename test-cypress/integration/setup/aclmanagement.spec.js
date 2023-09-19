import {AclManagementSteps} from "../../steps/setup/acl-management-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";

describe('ACL Management page', () => {

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
            checkRules(ACL);
        });

        it('Should move rule up', () => {
            AclManagementSteps.moveRuleUp(1);
            checkRules([ACL[1], ACL[0], ACL[2], ACL[3], ACL[4]]);
        });

        it('Should move rule down', () => {
            AclManagementSteps.moveRuleDown(1);
            checkRules([ACL[0], ACL[2], ACL[1], ACL[3], ACL[4]]);
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

        it('Should hide all unnecessary actions during rule editing', () => {
            // When there is no rule opened for edit
            // Then I expect that move up, move down, edit rule, create rule, delete rule buttons to be visible
            AclManagementSteps.getMoveUpButtons().should('have.length', 4);
            AclManagementSteps.getMoveDownButtons().should('have.length', 4);
            AclManagementSteps.deleteRuleButtons().should('have.length', 5);
            AclManagementSteps.editRuleButtons().should('have.length', 5);
            AclManagementSteps.createRuleButtons().should('have.length', 6);
            // When a rule is in edit mode
            AclManagementSteps.editRule(1);
            // Then I expect that move up, move down, edit rule, create rule, delete rule buttons to be hidden
            AclManagementSteps.getMoveUpButtons().should('have.length', 0);
            AclManagementSteps.getMoveDownButtons().should('have.length', 0);
            AclManagementSteps.deleteRuleButtons().should('have.length', 0);
            AclManagementSteps.editRuleButtons().should('have.length', 0);
            AclManagementSteps.createRuleButtons().should('have.length', 0);
        });

        it('Should add a new rule in the list', () => {
            // When I add a new rule
            AclManagementSteps.addRule(1);
            // Then I expect that the save rule button should be disabled because there mandatory fields in the new rule form
            checkIfRuleSavingIsForbidden(2);
            // When I fill in the subject field
            AclManagementSteps.getSubjectField(2).should('have.value', '*');
            AclManagementSteps.fillSubject(2, '<urn:John>');
            // Then I expect that the save rule button should still be disabled
            checkIfRuleSavingIsForbidden(2);
            // When I fill in the predicate field
            AclManagementSteps.getPredicateField(2).should('have.value', '*');
            AclManagementSteps.fillPredicate(2, '*');
            // Then I expect that the save rule button should still be disabled
            checkIfRuleSavingIsForbidden(2);
            // When I fill in the object field
            AclManagementSteps.getObjectField(2).should('have.value', '*');
            AclManagementSteps.fillObject(2, '*');
            // Then I expect that the save rule button should still be disabled
            checkIfRuleSavingIsForbidden(2);
            // When I fill in the context field
            AclManagementSteps.getContextField(2).should('have.value', '*');
            AclManagementSteps.fillContext(2, '*');
            // Then I expect that the save rule button should still be disabled
            checkIfRuleSavingIsForbidden(2);
            // When I fill in the role field
            AclManagementSteps.fillRole(2, 'ROLE1');
            // Then I expect that the save rule button should be enabled
            checkIfRuleSavingIsAllowed(2);
            // When I change the policy
            AclManagementSteps.selectPolicy(2, 'deny');
            // Then I expect that the save rule button should be enabled
            checkIfRuleSavingIsAllowed(2);
            // When I save the rule
            AclManagementSteps.saveRule(2);
            // Then the rule should be saved
            AclManagementSteps.getAclRules().should('have.length', 6);
            const newRule = {
                "subject": "<urn:John>",
                "predicate": "*",
                "object": "*",
                "context": "*",
                "role": "ROLE1",
                "policy": "deny",
                "moveUp": true,
                "moveDown": true
            };
            checkRules([ACL[0], ACL[1], newRule, ACL[2], ACL[3], ACL[4]]);
        });

        it('Should be able to edit rule', () => {
            // When I edit a rule
            AclManagementSteps.getAclRules().should('have.length', 5);
            AclManagementSteps.editRule(2);
            // Then I expect rule edit form to be opened
            AclManagementSteps.getAclRules().should('have.length', 5);
            checkRuleEditForm(2, {
                subject: '<<<http://example.com/test> <http://www.w3.org/2000/01/rdf-schema#label> "test aber auf Deutsch"@de>>',
                predicate: '*',
                object: '"test aber auf Deutsch"@en',
                context: '<http://example.com/graph1>',
                role: 'CUSTOM_ROLE3',
                policy: 'deny'
            });
            checkIfRuleSavingIsAllowed(2);
            // When I cancel the edit operation
            AclManagementSteps.cancelRuleEditing(2);
            // Then I expect that the rule will be opened in preview mode again with the same values
            AclManagementSteps.getAclRules().should('have.length', 5);
            checkRules(ACL);
            // When I edit the rule again
            AclManagementSteps.editRule(2);
            AclManagementSteps.fillSubject(2, '<urn:Me>');
            AclManagementSteps.fillPredicate(2, 'rdf:type');
            AclManagementSteps.fillObject(2, '*');
            AclManagementSteps.fillContext(2, '*');
            AclManagementSteps.fillRole(2, 'TEST');
            AclManagementSteps.selectPolicy(2, 'allow');
            // And I save the rule
            AclManagementSteps.saveRule(2);
            // Then I expect the rule to be saved with the new data
            const editedRule = {
                subject: '<urn:Me>',
                predicate: 'rdf:type',
                object: '*',
                context: '*',
                role: 'TEST',
                policy: 'allow'
            };
            checkRules([ACL[0], ACL[1], editedRule, ACL[3], ACL[4]]);
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
            checkRules([ACL[0], ACL[1], ACL[2], ACL[3]]);
        });
    });
});

function checkIfRuleSavingIsForbidden(index) {
    AclManagementSteps.getSaveRuleButton(index).should('not.exist');
    AclManagementSteps.getSaveRuleDisabledButton(index).should('be.visible');
}

function checkIfRuleSavingIsAllowed(index) {
    AclManagementSteps.getSaveRuleButton(index).should('be.visible');
    AclManagementSteps.getSaveRuleDisabledButton(index).should('not.exist');
}

function checkRuleEditForm(index, ruleData) {
    AclManagementSteps.getSubjectField(index).should('have.value', ruleData.subject);
    AclManagementSteps.getPredicateField(index).should('have.value', ruleData.predicate);
    AclManagementSteps.getObjectField(index).should('have.value', ruleData.object);
    AclManagementSteps.getContextField(index).should('have.value', ruleData.context);
    AclManagementSteps.getRoleField(index).should('have.value', ruleData.role);
    AclManagementSteps.getPolicySelectorField(index).should('have.value', ruleData.policy);
}

function checkRules(rules = []) {
    rules.forEach((rule, index) => {
        AclManagementSteps.getRule(index).within(() => {
            cy.get('td:nth-child(1)').should('contain.text', index);
            const moveUpVisibilityCommand = index > 0 ? 'be.visible' : 'not.exist';
            cy.get('td:nth-child(2)').scrollIntoView().find('.move-up-btn').should(moveUpVisibilityCommand);
            const moveDownVisibilityCommand = index < rules.length - 1 ? 'be.visible' : 'not.exist';
            cy.get('td:nth-child(2)').scrollIntoView().find('.move-down-btn').should(moveDownVisibilityCommand);
            cy.get('td:nth-child(3)').should('contain.text', rule.subject);
            cy.get('td:nth-child(4)').should('contain.text', rule.predicate);
            cy.get('td:nth-child(5)').should('contain.text', rule.object);
            cy.get('td:nth-child(6)').should('contain.text', rule.context);
            cy.get('td:nth-child(7)').should('contain.text', rule.role);
            cy.get('td:nth-child(8)').should('contain.text', rule.policy);
            cy.get('td:nth-child(9)').scrollIntoView().find('.delete-rule-btn').should('be.visible');
            cy.get('td:nth-child(9)').scrollIntoView().find('.edit-rule-btn').should('be.visible');
            cy.get('td:nth-child(9)').scrollIntoView().find('.add-rule-btn').should('be.visible');
        });
    });
}

const ACL = [
    {
        "subject": "<urn:Mary>",
        "predicate": "*",
        "object": "*",
        "context": "*",
        "role": "!CUSTOM_ROLE2",
        "policy": "allow",
        "moveUp": false,
        "moveDown": true
    },
    {
        "subject": "*",
        "predicate": "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>",
        "object": "*",
        "context": "*",
        "role": "CUSTOM_ROLE1",
        "policy": "deny",
        "moveUp": true,
        "moveDown": true
    },
    {
        "subject": "<<<http://example.com/test> <http://www.w3.org/2000/01/rdf-schema#label> \"test aber auf Deutsch\"@de>>",
        "predicate": "*",
        "object": "\"test aber auf Deutsch\"@en",
        "context": "<http://example.com/graph1>",
        "role": "CUSTOM_ROLE3",
        "policy": "deny",
        "moveUp": true,
        "moveDown": true
    },
    {
        "subject": "*",
        "predicate": "*",
        "object": "\"15\"^^<http://www.w3.org/2001/XMLSchema#int>",
        "context": "*",
        "role": "CUSTOM_ROLE3",
        "policy": "allow",
        "moveUp": true,
        "moveDown": true
    },
    {
        "subject": "<urn:Cat>",
        "predicate": "*",
        "object": "<<<http://example.com/test> <http://www.w3.org/2000/01/rdf-schema#label> \"test aber auf Deutsch\"@de>>",
        "context": "*",
        "role": "CUSTOM_ROLE4",
        "policy": "deny",
        "moveUp": true,
        "moveDown": false
    }
];
