import {YasguiSteps} from "./yasgui-steps";
import {SaveQueryDialog} from "./save-query-dialog";
import {ApplicationSteps} from "../application-steps";

export const DEFAULT_QUERY = 'select *';

export class SavedQuery {

    static create(queryName, query) {
        YasguiSteps.createSavedQuery();
        SaveQueryDialog.clearQueryNameField();
        const savedQueryName = queryName || this.generateQueryName();
        SaveQueryDialog.writeQueryName(savedQueryName);
        SaveQueryDialog.clearQueryField();
        SaveQueryDialog.writeQuery(query || DEFAULT_QUERY);
        SaveQueryDialog.toggleIsPublic();
        SaveQueryDialog.saveQuery();
        SaveQueryDialog.getSaveQueryDialog().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
    }

    static generateQueryName() {
        return 'Saved query - ' + Date.now();
    }
}
