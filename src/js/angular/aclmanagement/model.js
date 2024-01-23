export class ACListModel {
    /**
     * Constructs the ACListModel.
     * @param {ACRuleModel[]} aclRules
     */
    constructor(aclRules = []) {
        this._aclRules = new Map();
        aclRules.forEach(rule => {
            const scope = rule.scope;
            if (!this._aclRules.has(scope)) {
                this._aclRules.set(scope, []);
            }
            this._aclRules.get(scope).push(rule);
        });
    }


    size(scope) {
        return this._aclRules.get(scope) && this._aclRules.get(scope).length;
    }

    /**
     * Creates a new ACRuleModel using provided values and appends it at the end of the list.
     * @param {string} scope
     * @param {string} policy
     * @param {string} role
     * @param {string} operation
     * @param {string} subject
     * @param {string} predicate
     * @param {string} object
     * @param {string} context
     * @param {string} plugin
     */
    appendNewRule(scope, policy, role, operation, subject, predicate, object, context, plugin) {
        const rule = ACRuleFactory.createRule(scope, policy, role, operation, subject, predicate, object, context, plugin);
        if (!this._aclRules.has(scope)) {
            this._aclRules.set(scope, []);
        }
        this._aclRules.get(scope).push(rule);
    }

    /**
     * Creates a new ACRuleModel with default values and inserts it into specified index.
     * @param {string} scope
     * @param {number} index
     */
    addRule(scope, index) {
        const ruleList = this._aclRules.get(scope);
        if (ruleList) {
            ruleList.splice(index, 0, ACRuleFactory.createRule(scope));
        }
    }

    /**
     * Removes a rule from the specified scope at the given index.
     *
     * @param {string} scope - The scope from which to remove the rule.
     * @param {number} index - The index of the rule to remove.
     */
    removeRule(scope, index) {
        const ruleList = this._aclRules.get(scope);
        if (ruleList) {
            ruleList.splice(index, 1);
        }
    }

    /**
     * Replaces a rule at a specified index in the rule list for a given scope.
     * If the scope does not exist or the rule list is empty, this method does nothing.
     *
     * @param {string} scope - The scope for which to replace the rule.
     * @param {number} index - The index at which to replace the rule in the rule list.
     * @param {object} rule - The new rule to replace the existing rule at the specified index.
     */
    replaceRule(scope, index, rule) {
        const ruleList = this._aclRules.get(scope);
        if (ruleList) {
            ruleList.splice(index, 1, rule);
        }
    }

    /**
     * Returns the rule at the specified index for the given scope.
     * @param {string} scope - The scope for which to retrieve the rule.
     * @param {number} index - The index of the rule to retrieve.
     * @returns {object|null} - The rule at the specified index for the given scope, or null if no rule exists.
     */
    getRule(scope, index) {
        const ruleList = this._aclRules.get(scope);
        return ruleList ? ruleList[index] : null;
    }

    /**
     * Checks if the rule at the specified <code>index</code> is duplicated.
     *
     * @param {string} scope - The scope of the rule to be checked.
     * @param {number} indexRuleToBeChecked - The index of the rule to be checked.
     * @returns {boolean} - True if the model has a duplication of the rule at the specified index, otherwise false.
     */
    isRuleDuplicated(scope, indexRuleToBeChecked) {
        const checkedRule = this.getRule(scope, indexRuleToBeChecked);
        if (!checkedRule) {
            return false;
        }

        return this._aclRules.get(scope).some((rule, index) => {
            if (index !== indexRuleToBeChecked) {
                return angular.equals(checkedRule, rule);
            }
            return false;
        });
    }

    /**
     * Returns a copy of a rule object at a specified index within a given scope.
     *
     * @param {string} scope - The scope of the rule.
     * @param {number} index - The index of the rule within the scope.
     * @returns {Object} - A copied rule object.
     */
    getRuleCopy(scope, index) {
        const rule = this.getRule(scope, index);
        return {
            scope: rule.scope,
            policy: rule.policy,
            role: rule.role,
            operation: rule.operation,
            subject: rule.subject,
            predicate: rule.predicate,
            object: rule.object,
            context: rule.context,
            plugin: rule.plugin
        };
    }

    moveUp(scope, index) {
        const ruleList = this._aclRules.get(scope);
        const previousRule = ruleList[index - 1];
        ruleList[index - 1] = ruleList[index];
        ruleList[index] = previousRule;
    }

    moveDown(scope, index) {
        const ruleList = this._aclRules.get(scope);
        const nextRule = ruleList[index + 1];
        ruleList[index + 1] = ruleList[index];
        ruleList[index] = nextRule;
    }

    toJSON() {
        const json = [];
        this._aclRules.forEach((rules) => {
            rules.forEach(rule => json.push(rule.toJSON()));
        });
        return json;
    }

    get aclRules() {
        return this._aclRules;
    }

    set aclRules(value) {
        this._aclRules = value;
    }

    filterByScope(scope) {
        return this._aclRules.get(scope) || [];
    }
}

export class ACRuleModel {
    /**
     * Constructs the ACRuleModel.
     * @param {string} scope
     * @param {string} role
     * @param {string} policy
     */
    constructor(scope, role, policy) {
        this._scope = scope;
        this._role = role;
        this._policy = policy;
    }

    get scope() {
        return this._scope;
    }

    set scope(value) {
        this._scope = value;
    }

    get role() {
        return this._role;
    }

    set role(value) {
        this._role = value;
    }

    get policy() {
        return this._policy;
    }

    set policy(value) {
        this._policy = value;
    }

    toJSON() {
        // abstract method
    }
}

/**
 * Represents a statement-based access control rule model.
 * @extends ACRuleModel
 */
export class StatementACRuleModel extends ACRuleModel {
    /**
     * Creates a new statement in the Access Control List (ACL).
     *
     * @param {string} role - The role associated with the rule.
     * @param {string} [policy=ACL_POLICY.ALLOW] - The policy for the statement, defaults to "ALLOW".
     * @param {string} subject - The subject associated with the statement.
     * @param {string} predicate - The predicate associated with the statement.
     * @param {string} object - The object associated with the statement.
     * @param {string} context - The context associated with the statement.
     * @param {string} operation - The operation associated with the statement.
     */
    constructor(role, policy, subject, predicate, object, context, operation) {
        super(ACL_SCOPE.STATEMENT, role, policy);
        this._subject = subject;
        this._predicate = predicate;
        this._object = object;
        this._context = context;
        this._operation = operation;
    }

    get subject() {
        return this._subject;
    }

    set subject(value) {
        this._subject = value;
    }

    get predicate() {
        return this._predicate;
    }

    set predicate(value) {
        this._predicate = value;
    }

    get object() {
        return this._object;
    }

    set object(value) {
        this._object = value;
    }

    get context() {
        return this._context;
    }

    set context(value) {
        this._context = value;
    }

    get operation() {
        return this._operation;
    }

    set operation(value) {
        this._operation = value;
    }

    toJSON() {
        return {
            scope: this.scope,
            policy: this.policy,
            role: this.role,
            operation: this.operation,
            subject: this.subject,
            predicate: this.predicate,
            object: this.object,
            context: this.context
        }
    }


}

/**
 * Represents a rule model for PluginAC.
 * The rule defines the permissions for a specific plugin and operation.
 *
 * @extends ACRuleModel
 */
export class PluginACRuleModel extends ACRuleModel {
    /**
     * Constructor for creating a new ACLPluginScopedRule object.
     *
     * @param {string} role - The role associated with the rule.
     * @param {string} [policy=ACL_POLICY.ALLOW] - The policy associated with the rule. Defaults to "ALLOW".
     * @param {string} plugin - The plugin associated with the rule.
     * @param {string} operation - The operation associated with the rule.
     */
    constructor(role, policy, plugin, operation) {
        super(ACL_SCOPE.PLUGIN, role, policy);
        this._plugin = plugin;
        this._operation = operation;
    }

    get plugin() {
        return this._plugin;
    }

    set plugin(value) {
        this._plugin = value;
    }

    get operation() {
        return this._operation;
    }

    set operation(value) {
        this._operation = value;
    }

    toJSON() {
        return {
            scope: this.scope,
            policy: this.policy,
            role: this.role,
            operation: this.operation,
            plugin: this.plugin
        }
    }
}

/**
 * Represents a ClearGraphACRuleModel.
 *
 * @extends ACRuleModel
 */
export class ClearGraphACRuleModel extends ACRuleModel {
    /**
     * Creates a new instance of the constructor.
     *
     * @param {string} role - The role associated with the rule.
     * @param {string} [policy=ACL_POLICY.ALLOW] - The policy for the role. Default value is ACL_POLICY.ALLOW.
     * @param {Object} context - The context object.
     */
    constructor(role, policy, context) {
        super(ACL_SCOPE.CLEAR_GRAPH, role, policy);
        this._context = context;
    }

    get context() {
        return this._context;
    }

    set context(value) {
        this._context = value;
    }

    toJSON() {
        return {
            scope: this.scope,
            policy: this.policy,
            role: this.role,
            context: this.context
        }
    }
}

/**
 * Represents a system access control rule model.
 * @extends ACRuleModel
 */
export class SystemACRuleModel extends ACRuleModel {
    constructor(role, policy, operation) {
        super(ACL_SCOPE.SYSTEM, role, policy);
        this._operation = operation;
    }

    get operation() {
        return this._operation;
    }

    set operation(value) {
        this._operation = value;
    }

    toJSON() {
        return {
            scope: this.scope,
            policy: this.policy,
            role: this.role,
            operation: this.operation
        }
    }
}

class ACRuleFactory {
    /**
     * Creates an access control rule based on the given parameters.
     *
     * @param {string} scope - The scope of the rule. Can be one of ACL_SCOPE.STATEMENT, ACL_SCOPE.PLUGIN, ACL_SCOPE.CLEAR_GRAPH, or ACL_SCOPE.SYSTEM.
     * @param {string} policy - The policy of the rule. Can be "ALLOW" or "DENY".
     * @param {string} role - The role associated with the rule.
     * @param {string} operation - The operation associated with the rule.
     * @param {string} subject - The subject associated with the rule.
     * @param {string} predicate - The predicate associated with the rule.
     * @param {string} object - The object associated with the rule.
     * @param {string} context - The context associated with the rule.
     * @param {string} plugin - The plugin associated with the rule.
     * @returns {ACRuleModel} - The created access control rule.
     * @throws {Error} - Throws an error if an invalid scope is provided.
     */
    static createRule(scope, policy, role, operation, subject, predicate, object, context, plugin) {
        switch (scope) {
            case ACL_SCOPE.STATEMENT:
                return new StatementACRuleModel(role, policy, subject, predicate, object, context, operation);
            case ACL_SCOPE.PLUGIN:
                return new PluginACRuleModel(role, policy, plugin, operation);
            case ACL_SCOPE.CLEAR_GRAPH:
                return new ClearGraphACRuleModel(role, policy, context);
            case ACL_SCOPE.SYSTEM:
                return new SystemACRuleModel(role, policy, operation);
            default:
                throw new Error("Invalid scope: " + scope + " provided");
        }
    }
}

export const ACL_POLICY = {
    ALLOW: 'allow',
    DENY: 'deny'
};

export const ACL_OPERATION = {
    READ: 'read',
    WRITE: 'write'
};

export const ACL_SCOPE = {
    STATEMENT: 'statement',
    CLEAR_GRAPH: 'clear_graph',
    PLUGIN: 'plugin',
    SYSTEM: 'system'
}
