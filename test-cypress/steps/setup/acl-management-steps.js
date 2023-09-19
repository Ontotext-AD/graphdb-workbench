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
        return this.getAclTable().find('.toolbar .add-rule-btn').scrollIntoView();
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
        return this.getRule(index).find('.subject-cell input');
    }

    static fillSubject(index, value) {
        this.getSubjectField(index).clear().type(value);
    }

    static getPredicateField(index) {
        return this.getRule(index).find('.predicate-cell input');
    }

    static fillPredicate(index, value) {
        this.getPredicateField(index).clear().type(value);
    }

    static getObjectField(index) {
        return this.getRule(index).find('.object-cell input');
    }

    static fillObject(index, value) {
        this.getObjectField(index).clear().type(value);
    }

    static getContextField(index) {
        return this.getRule(index).find('.context-cell input');
    }

    static fillContext(index, value) {
        this.getContextField(index).clear().type(value);
    }

    static getRoleField(index) {
        return this.getRule(index).find('.role-cell input');
    }

    static fillRole(index, value) {
        this.getRoleField(index).clear().type(value);
    }

    static getPolicySelectorField(index) {
        return this.getRule(index).find('.policy-cell select');
    }

    static selectPolicy(index, value) {
        this.getPolicySelectorField(index).select(value);
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
}

const ACL = [
    {
        "subject": "<urn:Mary>",
        "predicate": "*",
        "object": "*",
        "context": "*",
        "role": "!CUSTOM_ROLE2",
        "policy": "allow"
    },
    {
        "subject": "*",
        "predicate": "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>",
        "object": "*",
        "context": "*",
        "role": "CUSTOM_ROLE1",
        "policy": "deny"
    },
    {
        "subject": "<<<http://example.com/test> <http://www.w3.org/2000/01/rdf-schema#label> \"test aber auf Deutsch\"@de>>",
        "predicate": "*",
        "object": "\"test aber auf Deutsch\"@en",
        "context": "<http://example.com/graph1>",
        "role": "CUSTOM_ROLE3",
        "policy": "deny"
    },
    {
        "subject": "*",
        "predicate": "*",
        "object": "\"15\"^^<http://www.w3.org/2001/XMLSchema#int>",
        "context": "*",
        "role": "CUSTOM_ROLE3",
        "policy": "allow"
    },
    {
        "subject": "<urn:Cat>",
        "predicate": "*",
        "object": "<<<http://example.com/test> <http://www.w3.org/2000/01/rdf-schema#label> \"test aber auf Deutsch\"@de>>",
        "context": "*",
        "role": "CUSTOM_ROLE4",
        "policy": "deny"
    }
];
