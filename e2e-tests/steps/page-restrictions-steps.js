import {BaseSteps} from "./base-steps.js";

/**
 * Steps for the restriction block (`app-page-restrictions`) that the new workbench shows instead of a
 * page's content when the page is restricted. For its repository picker see {@link RepositoryPickerListSteps}.
 */
export class PageRestrictionsSteps extends BaseSteps {

    static getRestrictions() {
        return this.getByTestId('page-restrictions');
    }

    static getMessages() {
        return this.getRestrictions().find(this.buildTestIdAttr('page-restriction-message'));
    }

    static getInternalLink() {
        return this.getMessages().find(this.buildTestIdAttr('restriction-internal-link'));
    }

    static getMessage(text) {
        return this.getMessages().contains(text);
    }
}
