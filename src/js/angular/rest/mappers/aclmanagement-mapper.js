/**
 * Maps the GET ACL rules response to internal model.
 * @param {Object} response
 * @return {ACListModel}
 */
import {ACListModel, ACRuleModel} from "../../aclmanagement/model";

/**
 * Maps the ACL rules response to ACListModel.
 * @param {Object} response
 * @return {*[]|ACListModel}
 */
export const mapAclRulesResponse = (response) => {
    if (response) {
        const rules = response.map((rule) => {
            return new ACRuleModel(
                rule.subject,
                rule.predicate,
                rule.object,
                rule.context,
                rule.role,
                rule.policy
            );
        });
        return new ACListModel(rules);
    }
  return [];
};
