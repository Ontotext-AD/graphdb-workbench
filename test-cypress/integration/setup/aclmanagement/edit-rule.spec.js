import {AclManagementSteps} from "../../../steps/setup/acl-management-steps";
import {ACL_VIEW} from "../../../steps/setup/acl-management-steps";
import {ApplicationSteps} from "../../../steps/application-steps";

describe('ACL Management: edit rule', () => {

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

    it('Should hide all unnecessary actions during rule editing', () => {
        // When there is no rule opened for edit
        // Then I expect that move up, move down, edit rule, create rule, delete rule buttons to be visible
        AclManagementSteps.getMoveUpButtons().should('have.length', 4);
        AclManagementSteps.getMoveDownButtons().should('have.length', 4);
        AclManagementSteps.deleteRuleButtons().should('have.length', 5);
        AclManagementSteps.editRuleButtons().should('have.length', 5);
        AclManagementSteps.createRuleButtons().should('have.length', 5);
        // When a rule is in edit mode
        AclManagementSteps.editRule(1);
        // Then I expect that move up, move down, edit rule, create rule, delete rule buttons to be hidden
        AclManagementSteps.getMoveUpButtons().should('have.length', 0);
        AclManagementSteps.getMoveDownButtons().should('have.length', 0);
        AclManagementSteps.deleteRuleButtons().should('have.length', 0);
        AclManagementSteps.editRuleButtons().should('have.length', 0);
        AclManagementSteps.createRuleButtons().should('have.length', 0);
    });

    it('Should be able to edit rule', () => {
        // When I edit a rule
        AclManagementSteps.getAclRules().should('have.length', 5);
        AclManagementSteps.editRule(2);
        // Then I expect rule edit form to be opened
        AclManagementSteps.getAclRules().should('have.length', 5);
        AclManagementSteps.checkRuleEditForm(2, {
            subject: '<<<http://example.com/test> <http://www.w3.org/2000/01/rdf-schema#label> "test aber auf Deutsch"@de>>',
            predicate: '*',
            object: '"test aber auf Deutsch"@en',
            context: '<http://example.com/graph1>',
            role: 'ROLE3',
            policy: 'deny'
        });
        AclManagementSteps.checkIfRuleSavingIsAllowed(2);
        // When I cancel the edit operation
        AclManagementSteps.cancelRuleEditing(2);
        // Then I expect that the rule will be opened in preview mode again with the same values
        AclManagementSteps.getAclRules().should('have.length', 5);
        AclManagementSteps.checkStatementRules(ACL_VIEW);
        // When I edit the rule again
        AclManagementSteps.editRule(2);
        AclManagementSteps.fillSubject(2, '<urn:Me>');
        // this will be autocompleted to "<http://www.w3.org/1999/02/22-rdf-syntax-ns#>"
        AclManagementSteps.fillPredicate(2, 'rdf:');
        AclManagementSteps.fillObject(2, '*');
        AclManagementSteps.fillContext(2, '*');
        AclManagementSteps.fillRole(2, 'TEST');
        AclManagementSteps.selectPolicy(2, 'allow');
        AclManagementSteps.selectOperation(2, 'write');
        // And I save the rule
        AclManagementSteps.saveRule(2);
        // Then I expect the rule to be saved with the new data
        const editedRule = {
            scope: "statement",
            policy: 'allow',
            role: 'TEST',
            operation: "write",
            subject: '<urn:Me>',
            predicate: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#>',
            object: '*',
            context: '*'
        };
        AclManagementSteps.checkStatementRules([ACL_VIEW[0], ACL_VIEW[1], editedRule, ACL_VIEW[3], ACL_VIEW[4]]);
    });
});

