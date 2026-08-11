import {AclManagementSteps} from "../../../steps/setup/acl-management-steps";
import {ApplicationSteps} from "../../../steps/application-steps";

describe('ACL Management: IRI validation', () => {

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
        ApplicationSteps.getLoader().should('not.exist');
    });

    /**
     * Fills in all the fields required for the rule to be otherwise valid, except the subject,
     * so that only the subject's own validity determines whether the rule can be saved.
     * @param {number} index
     */
    const fillMandatoryFieldsExceptSubject = (index) => {
        AclManagementSteps.fillRole(index, 'ROLE1');
        AclManagementSteps.selectPolicy(index, 'allow');
        AclManagementSteps.selectOperation(index, 'write');
        AclManagementSteps.fillPredicate(index, '*');
        AclManagementSteps.fillObject(index, '*');
        AclManagementSteps.fillContext(index, '*');
    };

    it('should mark the subject field as invalid and block saving when an absolute http IRI is typed without angle brackets', () => {
        // When I create a new rule and type an absolute http IRI without wrapping it in angle brackets
        AclManagementSteps.addRuleInBeginning();
        fillMandatoryFieldsExceptSubject(0);
        AclManagementSteps.fillSubject(0, 'http://example.com/John');

        // Then I expect the field to be marked as invalid
        AclManagementSteps.getSubjectField(0).should('have.class', 'invalid');
        // And I expect saving the rule to be forbidden
        AclManagementSteps.checkIfRuleSavingIsForbidden(0);
    });

    it('should mark the subject field as valid and allow saving once the http IRI is wrapped in angle brackets', () => {
        // When I create a new rule and type a properly wrapped absolute http IRI
        AclManagementSteps.addRuleInBeginning();
        fillMandatoryFieldsExceptSubject(0);
        AclManagementSteps.fillSubject(0, '<http://example.com/John>');

        // Then I expect the field to be marked as valid
        AclManagementSteps.getSubjectField(0).should('not.have.class', 'invalid');
        // And I expect saving the rule to be allowed
        AclManagementSteps.checkIfRuleSavingIsAllowed(0);
    });

    it('should mark the subject field as invalid for a urn IRI without angle brackets and valid once wrapped', () => {
        // When I create a new rule and type a urn IRI without angle brackets
        AclManagementSteps.addRuleInBeginning();
        fillMandatoryFieldsExceptSubject(0);
        AclManagementSteps.fillSubject(0, 'urn:John');

        // Then I expect the field to be marked as invalid
        AclManagementSteps.getSubjectField(0).should('have.class', 'invalid');
        AclManagementSteps.checkIfRuleSavingIsForbidden(0);

        // When I wrap the same urn IRI in angle brackets
        AclManagementSteps.fillSubject(0, '<urn:John>');

        // Then I expect the field to become valid
        AclManagementSteps.getSubjectField(0).should('not.have.class', 'invalid');
        AclManagementSteps.checkIfRuleSavingIsAllowed(0);
    });

    it('should keep the wildcard (*) value valid', () => {
        // When I create a new rule and use the wildcard value for the subject
        AclManagementSteps.addRuleInBeginning();
        fillMandatoryFieldsExceptSubject(0);
        AclManagementSteps.fillSubject(0, '*');

        // Then I expect the field to remain valid
        AclManagementSteps.getSubjectField(0).should('not.have.class', 'invalid');
        AclManagementSteps.checkIfRuleSavingIsAllowed(0);
    });

    it('should still query autocomplete suggestions for an absolute IRI typed without angle brackets', () => {
        // Given I intercept the autocomplete suggestions requests
        cy.intercept('GET', '**/rest/autocomplete/query*').as('autocompleteQuery');

        // When I create a new rule and type an absolute http IRI without angle brackets
        AclManagementSteps.addRuleInBeginning();
        fillMandatoryFieldsExceptSubject(0);
        AclManagementSteps.fillSubject(0, 'http://example.com/resource/John');

        // Then I expect the autocomplete request to still be triggered, searching only by the
        // local name within the detected namespace (namespace and local name joined by ";")
        cy.wait('@autocompleteQuery');
        cy.get('@autocompleteQuery.all').then((interceptions) => {
            const lastCall = interceptions[interceptions.length - 1];
            const url = new URL(lastCall.request.url);
            expect(url.searchParams.get('q')).to.eq('http://example.com/resource/;John');
        });
    });

    it('should reject a triple term value for a plain field validated only as an IRI', () => {
        // Predicate only allows validate-uri/validate-default-value, so a triple term is not a valid value there
        AclManagementSteps.addRuleInBeginning();
        AclManagementSteps.fillRole(0, 'ROLE1');
        AclManagementSteps.selectPolicy(0, 'allow');
        AclManagementSteps.selectOperation(0, 'write');
        AclManagementSteps.fillSubject(0, '*');
        AclManagementSteps.fillObject(0, '*');
        AclManagementSteps.fillContext(0, '*');
        AclManagementSteps.fillPredicate(0, '<<(<http://example.com/a> <http://example.com/b> "c")>>');

        AclManagementSteps.getPredicateField(0).should('have.class', 'invalid');
        AclManagementSteps.checkIfRuleSavingIsForbidden(0);
    });

    it('should accept a triple term value for the object field, where it is allowed', () => {
        // Only the object field is configured with validate-triple-term-value="true"
        AclManagementSteps.addRuleInBeginning();
        AclManagementSteps.fillRole(0, 'ROLE1');
        AclManagementSteps.selectPolicy(0, 'allow');
        AclManagementSteps.selectOperation(0, 'write');
        AclManagementSteps.fillSubject(0, '*');
        AclManagementSteps.fillPredicate(0, '*');
        AclManagementSteps.fillContext(0, '*');
        AclManagementSteps.fillObject(0, '<<(<http://example.com/a> <http://example.com/b> "c")>>');

        AclManagementSteps.getObjectField(0).should('not.have.class', 'invalid');
        AclManagementSteps.checkIfRuleSavingIsAllowed(0);
    });

    it('should reject a malformed triple term value (missing closing brackets) for the object field', () => {
        AclManagementSteps.addRuleInBeginning();
        AclManagementSteps.fillRole(0, 'ROLE1');
        AclManagementSteps.selectPolicy(0, 'allow');
        AclManagementSteps.selectOperation(0, 'write');
        AclManagementSteps.fillSubject(0, '*');
        AclManagementSteps.fillPredicate(0, '*');
        AclManagementSteps.fillContext(0, '*');
        AclManagementSteps.fillObject(0, '<<(<http://example.com/a> <http://example.com/b> "c")');

        AclManagementSteps.getObjectField(0).should('have.class', 'invalid');
        AclManagementSteps.checkIfRuleSavingIsForbidden(0);
    });
});

