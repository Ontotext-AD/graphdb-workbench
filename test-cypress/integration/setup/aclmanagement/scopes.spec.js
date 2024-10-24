import {AclManagementSteps} from "../../../steps/setup/acl-management-steps";
import {ApplicationSteps} from "../../../steps/application-steps";

describe('ACL Management: rule scopes', () => {

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
        AclManagementSteps.visit();
        ApplicationSteps.geLoader().should('not.exist');
    });


    it('Should render empty tabs', () => {
        // I expect 4 tabs
        AclManagementSteps.getAclTabs().should('have.length', 4);
        // I expect empty rules table
        AclManagementSteps.getAclTable().should('be.visible');
        AclManagementSteps.getAclTabs().should('be.visible');
        AclManagementSteps.getNoDataMessage().should('be.visible');
        AclManagementSteps.getActiveTab().should('have.text', 'Statement');
        // When I select Clear graph tab
        AclManagementSteps.selectTab(1);
        // I expect empty rules table
        AclManagementSteps.getAclTabs().should('be.visible');
        AclManagementSteps.getNoDataMessage().should('be.visible');
        AclManagementSteps.getActiveTab().should('have.text', 'Clear graph');
        // When I select Plugins tab
        AclManagementSteps.selectTab(2);
        // I expect empty rules table
        AclManagementSteps.getAclTabs().should('be.visible');
        AclManagementSteps.getNoDataMessage().should('be.visible');
        AclManagementSteps.getActiveTab().should('have.text', 'Plugin');
        // When I select System tab
        AclManagementSteps.selectTab(3);
        // I expect empty rules table
        AclManagementSteps.getAclTabs().should('be.visible');
        AclManagementSteps.getNoDataMessage().should('be.visible');
        AclManagementSteps.getActiveTab().should('have.text', 'System');
    });

    it('Should create rules', () => {
        // I select Clear graph tab
        AclManagementSteps.selectTab(1);
        AclManagementSteps.getActiveTab().should('have.text', 'Clear graph');
        AclManagementSteps.getActiveTabDirtyIcon().should('not.exist');
        // I can create rule
        AclManagementSteps.addRuleInBeginning();
        // I fill the policy
        AclManagementSteps.selectPolicy(0, 'deny');
        // I fill in the role field
        AclManagementSteps.fillRole(0, 'ROLE1');
        // I fill in the context field
        AclManagementSteps.fillContext(0, 'all');
        // I save the rule
        AclManagementSteps.saveRule(0);
        // Then the tab label is changed
        AclManagementSteps.getActiveTabDirtyIcon().should('be.visible');

        // I select Plugin tab
        AclManagementSteps.selectTab(2);
        AclManagementSteps.getActiveTab().should('have.text', 'Plugin');
        AclManagementSteps.getActiveTabDirtyIcon().should('not.exist');
        // I can create rule
        AclManagementSteps.addRuleInBeginning();
        // I fill the policy
        AclManagementSteps.selectPolicy(0, 'deny');
        // I fill in the role field
        AclManagementSteps.fillRole(0, 'ROLE2');
        // I select the operation
        AclManagementSteps.selectOperation(0, 'write');
        // I fill in the plugin field
        AclManagementSteps.fillPlugin(0, '*');
        // I save the rule
        AclManagementSteps.saveRule(0);
        // Then the tab label is changed
        AclManagementSteps.getActiveTabDirtyIcon().should('be.visible');

        // I select System tab
        AclManagementSteps.selectTab(3);
        AclManagementSteps.getActiveTab().should('have.text', 'System');
        AclManagementSteps.getActiveTabDirtyIcon().should('not.exist');
        // I can create rule
        AclManagementSteps.addRuleInBeginning();
        // I fill the policy
        AclManagementSteps.selectPolicy(0, 'allow');
        // I fill in the role field
        AclManagementSteps.fillRole(0, 'ROLE3');
        // I select the operation
        AclManagementSteps.selectOperation(0, 'write');
        // I save the rule
        AclManagementSteps.saveRule(0);
        // Then the tab label is changed
        AclManagementSteps.getActiveTabDirtyIcon().should('be.visible');

        // I select Statement tab
        AclManagementSteps.selectTab(0);
        AclManagementSteps.getActiveTab().should('have.text', 'Statement');
        AclManagementSteps.getActiveTabDirtyIcon().should('not.exist');
        // I can create rule
        AclManagementSteps.addRuleInBeginning();
        // I fill the policy
        AclManagementSteps.selectPolicy(0, 'deny');
        // I fill in the role field
        AclManagementSteps.fillRole(0, 'ROLE4');
        // I select the operation
        AclManagementSteps.selectOperation(0, 'write');
        // I fill in the subject field
        AclManagementSteps.fillSubject(0, '*');
        // I fill in the predicate field
        AclManagementSteps.fillPredicate(0, '*');
        // I fill in the object field
        AclManagementSteps.fillObject(0, '*');
        // I fill in the context field
        AclManagementSteps.fillContext(0, '*');
        // I save the rule
        AclManagementSteps.saveRule(0);
        // Then the tab label is changed
        AclManagementSteps.getActiveTabDirtyIcon().should('be.visible');

        cy.intercept('PUT', '/rest/repositories/acl-management-*/acl').as('putCall');

        // And I save the ACL
        AclManagementSteps.saveAcl();
        // Then wait for the PUT call to occur and assert the request body
        cy.wait('@putCall').then((interception) => {
            const expectedPayload = [
                {
                    "scope": "clear_graph",
                    "policy": "deny",
                    "role": "CUSTOM_ROLE1",
                    "context": "all",
                    "warnForPrefix": false
                },
                {
                    "scope": "plugin",
                    "policy": "deny",
                    "role": "CUSTOM_ROLE2",
                    "operation": "write",
                    "plugin": "*",
                    "warnForPrefix": false
                },
                {
                    "scope": "system",
                    "policy": "allow",
                    "role": "CUSTOM_ROLE3",
                    "operation": "write",
                    "warnForPrefix": false
                },
                {
                    "scope": "statement",
                    "policy": "deny",
                    "role": "CUSTOM_ROLE4",
                    "operation": "write",
                    "subject": "*",
                    "predicate": "*",
                    "object": "*",
                    "context": "*",
                    "warnForPrefix": false
                }
            ];
            expect(interception.request.body).to.deep.eq(expectedPayload);
        });

        ApplicationSteps.geLoader().should('not.exist');
        // Then I expect the ACL to be saved
        ApplicationSteps.getSuccessNotifications().should('be.visible');

        // I expect to be on Statement tab
        AclManagementSteps.getActiveTab().should('have.text', 'Statement');
        AclManagementSteps.getActiveTabDirtyIcon().should('not.exist');
        // I expect to have one statement rule
        AclManagementSteps.getAclRules().should('have.length', 1);
        const expectedStatementRule = {
            "scope": "statement",
            "policy": "deny",
            "role": "ROLE4",
            "operation": "write",
            "subject": "*",
            "predicate": "*",
            "object": "*",
            "context": "*"
        };
        AclManagementSteps.checkStatementRules([expectedStatementRule]);

        // I visit Clear graph tab
        AclManagementSteps.selectTab(1);
        AclManagementSteps.getActiveTab().should('have.text', 'Clear graph');
        AclManagementSteps.getActiveTabDirtyIcon().should('not.exist');
        const expectedClearGraphRule = {
            "scope": "clear_graph",
            "policy": "deny",
            "role": "ROLE1",
            "context": "all"
        };
        AclManagementSteps.checkClearGraphRules([expectedClearGraphRule]);

        // I visit Plugin tab
        AclManagementSteps.selectTab(2);
        AclManagementSteps.getActiveTab().should('have.text', 'Plugin');
        AclManagementSteps.getActiveTabDirtyIcon().should('not.exist');
        const expectedPluginRule = {
            "scope": "plugin",
            "policy": "deny",
            "role": "ROLE2",
            "operation": "write",
            "plugin": "*"
        };
        AclManagementSteps.checkPluginRules([expectedPluginRule]);

        // I visit System tab
        AclManagementSteps.selectTab(3);
        AclManagementSteps.getActiveTab().should('have.text', 'System');
        AclManagementSteps.getActiveTabDirtyIcon().should('not.exist');
        const expectedSystemRule = {
            "scope": "system",
            "policy": "allow",
            "role": "ROLE3",
            "operation": "write"
        };
        AclManagementSteps.checkSystemRules([expectedSystemRule]);
    });
});
