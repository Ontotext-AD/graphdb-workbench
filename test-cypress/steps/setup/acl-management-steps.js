export class AclManagementSteps {
    static visit() {
        cy.visit('/aclmanagement');
    }

    static getPage() {
        return cy.get('.acl-management-view');
    }

    static getPageHeading() {
        return this.getPage().find('#acl-management-view-title');
    }

    static getAclTable() {
        return this.getPage().find('.acl-rules');
    }

    static getAclRules() {
        return this.getAclTable().find('tbody tr.acl-rule');
    }

    static getAddFirstRuleButton() {
        return cy.get('.add-first-rule-btn').scrollIntoView();
    }

    static getRule(index) {
        return this.getAclRules().eq(index);
    }

    static importRules(repositoryId) {
        return cy.request({
            method: 'POST',
            url: `/rest/repositories/${repositoryId}/acl`,
            body: ACL
        }).then((response) => {
            cy.waitUntil(() => response && response.status === 201);
        });
    }

    static getMoveUpButton(index) {
        return this.getAclRules().eq(index).find('td:nth-child(2) .move-up-btn');
    }

    static moveRuleUp(index) {
        this.getMoveUpButton(index).click();
    }

    static getMoveDownButton(index) {
        return this.getAclRules().eq(index).find('td:nth-child(2) .move-down-btn');
    }

    static moveRuleDown(index) {
        this.getMoveDownButton(index).click();
    }

    static getNoDataMessage() {
        return this.getAclTable().find('.no-data');
    }

    static getAclTabs() {
        return cy.get('.nav-tabs.acl-tabs .nav-item');
    }

    static getActiveTab() {
        return this.getAclTabs().find('.active');
    }

    static selectTab(index) {
        return this.getAclTabs().eq(index).click();
    }

    static addRuleInBeginning() {
        this.getAddFirstRuleButton().click();
    }

    static getAddRuleButton(index) {
        return this.getRule(index).find('.add-rule-btn');
    }

    static addRule(index) {
        this.getAddRuleButton(index).click();
    }

    static getEditRuleButton(index) {
        return this.getRule(index).find('.edit-rule-btn');
    }

    static editRule(index) {
        this.getEditRuleButton(index).click();
    }

    static getDeleteRuleButton(index) {
        return this.getRule(index).find('.delete-rule-btn');
    }

    static deleteRule(index) {
        this.getDeleteRuleButton(index).click();
    }

    static getCancelRuleEditingButton(index) {
        return this.getAclRules().eq(index).find('.cancel-rule-editing-btn');
    }

    static cancelRuleEditing(index) {
        this.getCancelRuleEditingButton(index).click();
    }

    static getSaveRuleButton(index) {
        return this.getRule(index).find('.save-rule-btn');
    }

    static getSaveRuleDisabledButton(index) {
        return this.getRule(index).find('.save-rule-disabled-btn');
    }

    static saveRule(index) {
        this.getSaveRuleButton(index).click();
    }

    static getSubjectField(index) {
        return this.getRule(index).find('.subject-cell textarea');
    }

    static fillSubject(index, value) {
        this.getSubjectField(index).clear().type(value);
    }

    static getPredicateField(index) {
        return this.getRule(index).find('.predicate-cell textarea');
    }

    static fillPredicate(index, value) {
        this.getPredicateField(index).clear().type(value);
    }

    static getObjectField(index) {
        return this.getRule(index).find('.object-cell textarea');
    }

    static fillObject(index, value) {
        this.getObjectField(index).clear().type(value);
    }

    static getContextField(index) {
        return this.getRule(index).find('.context-cell textarea');
    }

    static fillContext(index, value) {
        this.getContextField(index).clear().type(value);
    }

    static getRoleField(index) {
        return this.getRule(index).find('.role-cell textarea');
    }

    static fillRole(index, value) {
        this.getRoleField(index).clear().type(value);
    }

    static getPluginField(index) {
        return this.getRule(index).find('.plugin-cell textarea');
    }

    static fillPlugin(index, value) {
        this.getPluginField(index).clear().type(value);
    }

    static getPolicySelectorField(index) {
        return this.getRule(index).find('.policy-cell select');
    }

    static selectPolicy(index, value) {
        this.getPolicySelectorField(index).select(value);
    }

    static getOperationSelectorField(index) {
        return this.getRule(index).find('.operation-cell select');
    }

    static selectOperation(index, value) {
        this.getOperationSelectorField(index).select(value);
    }

    static getMoveUpButtons() {
        return this.getAclTable().find('.move-up-btn');
    }

    static getMoveDownButtons() {
        return this.getAclTable().find('.move-down-btn');
    }

    static deleteRuleButtons() {
        return this.getAclTable().find('.delete-rule-btn');
    }

    static editRuleButtons() {
        return this.getAclTable().find('.edit-rule-btn');
    }

    static createRuleButtons() {
        return this.getAclTable().find('.add-rule-btn');
    }

    static getSaveAclButton() {
        return this.getPage().find('.save-acl-btn');
    }

    static saveAcl() {
        this.getSaveAclButton().click();
    }

    static getCancelAclSavingButton() {
        return this.getPage().find('.cancel-acl-save-btn');
    }

    static cancelAclSaving() {
        this.getCancelAclSavingButton().click();
    }

    static checkStatementRules(rules = []) {
        rules.forEach((rule, index) => {
            AclManagementSteps.getRule(index).within(() => {
                cy.get('td:nth-child(1)').should('contain.text', index+1);
                const moveUpVisibilityCommand = index > 0 ? 'be.visible' : 'not.exist';
                cy.get('td:nth-child(2)').scrollIntoView().find('.move-up-btn').should(moveUpVisibilityCommand);
                const moveDownVisibilityCommand = index < rules.length - 1 ? 'be.visible' : 'not.exist';
                cy.get('td:nth-child(2)').scrollIntoView().find('.move-down-btn').should(moveDownVisibilityCommand);
                cy.get('td:nth-child(3)').should('contain.text', rule.policy);
                cy.get('td:nth-child(4)').invoke('text').then((text) => {
                    const normalizedText = text.replace(/\u00A0/g, ' ').trim();
                    expect(normalizedText).to.equal(rule.role);
                });
                cy.get('td:nth-child(5)').should('contain.text', rule.operation);
                cy.get('td:nth-child(6)').should('contain.text', rule.subject);
                cy.get('td:nth-child(7)').should('contain.text', rule.predicate);
                cy.get('td:nth-child(8)').should('contain.text', rule.object);
                cy.get('td:nth-child(9)').should('contain.text', rule.context);
                cy.get('td:nth-child(10)').scrollIntoView().find('.delete-rule-btn').should('be.visible');
                cy.get('td:nth-child(10)').scrollIntoView().find('.edit-rule-btn').should('be.visible');
                cy.get('td:nth-child(10)').scrollIntoView().find('.add-rule-btn').should('be.visible');
            });
        });
    }

    static checkClearGraphRules(rules = []) {
        rules.forEach((rule, index) => {
            AclManagementSteps.getRule(index).within(() => {
                cy.get('td:nth-child(1)').should('contain.text', index+1);
                const moveUpVisibilityCommand = index > 0 ? 'be.visible' : 'not.exist';
                cy.get('td:nth-child(2)').scrollIntoView().find('.move-up-btn').should(moveUpVisibilityCommand);
                const moveDownVisibilityCommand = index < rules.length - 1 ? 'be.visible' : 'not.exist';
                cy.get('td:nth-child(2)').scrollIntoView().find('.move-down-btn').should(moveDownVisibilityCommand);
                cy.get('td:nth-child(3)').should('contain.text', rule.policy);
                cy.get('td:nth-child(4)').invoke('text').then((text) => {
                    const normalizedText = text.replace(/\u00A0/g, ' ').trim();
                    expect(normalizedText).to.equal(rule.role);
                });
                cy.get('td:nth-child(5)').should('contain.text', rule.context);
                cy.get('td:nth-child(7)').scrollIntoView().find('.delete-rule-btn').should('be.visible');
                cy.get('td:nth-child(7)').scrollIntoView().find('.edit-rule-btn').should('be.visible');
                cy.get('td:nth-child(7)').scrollIntoView().find('.add-rule-btn').should('be.visible');
            });
        });
    }

    static checkPluginRules(rules = []) {
        rules.forEach((rule, index) => {
            AclManagementSteps.getRule(index).within(() => {
                cy.get('td:nth-child(1)').should('contain.text', index+1);
                const moveUpVisibilityCommand = index > 0 ? 'be.visible' : 'not.exist';
                cy.get('td:nth-child(2)').scrollIntoView().find('.move-up-btn').should(moveUpVisibilityCommand);
                const moveDownVisibilityCommand = index < rules.length - 1 ? 'be.visible' : 'not.exist';
                cy.get('td:nth-child(2)').scrollIntoView().find('.move-down-btn').should(moveDownVisibilityCommand);
                cy.get('td:nth-child(3)').should('contain.text', rule.policy);
                cy.get('td:nth-child(4)').invoke('text').then((text) => {
                    const normalizedText = text.replace(/\u00A0/g, ' ').trim();
                    expect(normalizedText).to.equal(rule.role);
                });
                cy.get('td:nth-child(5)').should('contain.text', rule.operation);
                cy.get('td:nth-child(6)').should('contain.text', rule.plugin);
                cy.get('td:nth-child(8)').scrollIntoView().find('.delete-rule-btn').should('be.visible');
                cy.get('td:nth-child(8)').scrollIntoView().find('.edit-rule-btn').should('be.visible');
                cy.get('td:nth-child(8)').scrollIntoView().find('.add-rule-btn').should('be.visible');
            });
        });
    }

    static checkSystemRules(rules = []) {
        rules.forEach((rule, index) => {
            AclManagementSteps.getRule(index).within(() => {
                cy.get('td:nth-child(1)').should('contain.text', index+1);
                const moveUpVisibilityCommand = index > 0 ? 'be.visible' : 'not.exist';
                cy.get('td:nth-child(2)').scrollIntoView().find('.move-up-btn').should(moveUpVisibilityCommand);
                const moveDownVisibilityCommand = index < rules.length - 1 ? 'be.visible' : 'not.exist';
                cy.get('td:nth-child(2)').scrollIntoView().find('.move-down-btn').should(moveDownVisibilityCommand);
                cy.get('td:nth-child(3)').should('contain.text', rule.policy);
                cy.get('td:nth-child(4)').invoke('text').then((text) => {
                    const normalizedText = text.replace(/\u00A0/g, ' ').trim();
                    expect(normalizedText).to.equal(rule.role);
                });
                cy.get('td:nth-child(5)').should('contain.text', rule.operation);
                cy.get('td:nth-child(7)').scrollIntoView().find('.delete-rule-btn').should('be.visible');
                cy.get('td:nth-child(7)').scrollIntoView().find('.edit-rule-btn').should('be.visible');
                cy.get('td:nth-child(7)').scrollIntoView().find('.add-rule-btn').should('be.visible');
            });
        });
    }

    static checkRuleEditForm(index, ruleData) {
        AclManagementSteps.getSubjectField(index).should('have.value', ruleData.subject);
        AclManagementSteps.getPredicateField(index).should('have.value', ruleData.predicate);
        AclManagementSteps.getObjectField(index).should('have.value', ruleData.object);
        AclManagementSteps.getContextField(index).should('have.value', ruleData.context);
        AclManagementSteps.getRoleField(index).should('have.value', ruleData.role);
        AclManagementSteps.getPolicySelectorField(index).should('have.value', ruleData.policy);
    }

    static checkIfRuleSavingIsForbidden(index) {
        AclManagementSteps.getSaveRuleButton(index).should('not.exist');
        AclManagementSteps.getSaveRuleDisabledButton(index).should('be.visible');
    }

    static checkIfRuleSavingIsAllowed(index) {
        AclManagementSteps.getSaveRuleButton(index).should('be.visible');
        AclManagementSteps.getSaveRuleDisabledButton(index).should('not.exist');
    }
}

export const ACL_VIEW = [
    {
        "scope": "statement",
        "policy": "allow",
        "role": "! ROLE2",
        "operation": "write",
        "subject": "<urn:Mary>",
        "predicate": "*",
        "object": "*",
        "context": "*"
    },
    {
        "scope": "statement",
        "policy": "deny",
        "role": "ROLE1",
        "operation": "read",
        "subject": "*",
        "predicate": "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>",
        "object": "*",
        "context": "*"
    },
    {
        "scope": "statement",
        "policy": "deny",
        "role": "ROLE3",
        "operation": "read",
        "subject": "<<<http://example.com/test> <http://www.w3.org/2000/01/rdf-schema#label> \"test aber auf Deutsch\"@de>>",
        "predicate": "*",
        "object": "\"test aber auf Deutsch\"@en",
        "context": "<http://example.com/graph1>"
    },
    {
        "scope": "statement",
        "policy": "allow",
        "role": "ROLE3",
        "operation": "write",
        "subject": "*",
        "predicate": "*",
        "object": "\"15\"^^<http://www.w3.org/2001/XMLSchema#int>",
        "context": "*"
    },
    {
        "scope": "statement",
        "policy": "deny",
        "role": "ROLE4",
        "operation": "write",
        "subject": "<urn:Cat>",
        "predicate": "*",
        "object": "<<<http://example.com/test> <http://www.w3.org/2000/01/rdf-schema#label> \"test aber auf Deutsch\"@de>>",
        "context": "*"
    }
];
export const ACL = [
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
