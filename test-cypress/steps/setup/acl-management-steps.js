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

    static getMoveDownButton(index) {
        return this.getAclRules().eq(index).find('td:nth-child(2) .move-down-btn');
    }

    static moveRuleUp(index) {
        this.getMoveUpButton(index).click();
    }

    static moveRuleDown(index) {
        this.getMoveDownButton(index).click();
    }

    static getNoDataMessage() {
        return this.getAclTable().find('.no-data');
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
