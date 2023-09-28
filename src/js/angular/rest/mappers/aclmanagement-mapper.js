/**
 * Maps the GET ACL rules response to internal model.
 * @param {Object} response
 * @return {ACListModel}
 */
import {ACListModel} from "../../aclmanagement/model";

/**
 * Maps the ACL rules response to ACListModel.
 * @param {Object} response
 * @return {ACListModel}
 */
export const mapAclRulesResponse = (response) => {
    const aclModel = new ACListModel();
    if (response && response.data) {
        response.data.forEach((rule) => {
            aclModel.appendNewRule(
                rule.subject,
                rule.predicate,
                rule.object,
                rule.context,
                rule.role,
                rule.policy
            );
        });
    }
    return aclModel;
};
