export class ACListModel {
    /**
     * Constructs the ACListModel.
     * @param {ACRuleModel[]} aclRules
     */
    constructor(aclRules) {
        this._aclRules = aclRules;
    }

    size() {
        return this.aclRules.length;
    }

    addRule(index) {
        this.aclRules.splice(index, 0, new ACRuleModel());
    }

    removeRule(index) {
        this.aclRules.splice(index, 1);
    }

    moveUp(index) {
        const previousRule = this.aclRules[index - 1];
        this.aclRules[index - 1] = this.aclRules[index];
        this.aclRules[index] = previousRule;
    }

    moveDown(index) {
        const nextRule = this.aclRules[index + 1];
        this.aclRules[index + 1] = this.aclRules[index];
        this.aclRules[index] = nextRule;
    }

    get aclRules() {
        return this._aclRules;
    }

    set aclRules(value) {
        this._aclRules = value;
    }
}

export class ACRuleModel {
    /**
     * Constructs the ACRuleModel.
     * @param {string} subject
     * @param {string} predicate
     * @param {string} object
     * @param {string} context
     * @param {string} role
     * @param {string} policy
     */
    constructor(subject = '', predicate = '', object= '', context= '', role= '', policy= ACL_POLICY.ALLOW) {
        this._subject = subject;
        this._predicate = predicate;
        this._object = object;
        this._context = context;
        this._role = role;
        this._policy = policy;
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
}

export const ACL_POLICY = {
    ALLOW: 'allow',
    DENY: 'deny'
};
