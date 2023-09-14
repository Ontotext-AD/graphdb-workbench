import {AclManagementSteps} from "../../steps/setup/acl-management-steps";

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
    });
});

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
