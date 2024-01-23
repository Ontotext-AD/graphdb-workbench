/**
 * Maps the GET ACL rules response to internal model.
 * @param {Object} response
 * @return {ACListModel}
 */
import {ACListModel} from "../../aclmanagement/model";

/**
 * Maps the ACL rules response to ACListModel.
 * If no scope provided, the rule is omitted.
 *
 * @param {Object} response
 * @return {ACListModel}
 */
export const mapAclRulesResponse = (response) => {
    const aclModel = new ACListModel();
    if (response && response.data) {
        response.data.forEach((rule) => {
            if (rule.scope) {
                aclModel.appendNewRule(
                    rule.scope,
                    rule.policy,
                    rule.role,
                    rule.operation,
                    rule.subject,
                    rule.predicate,
                    rule.object,
                    rule.context,
                    rule.plugin
                );
            }
        });
    }
    return aclModel;
};
