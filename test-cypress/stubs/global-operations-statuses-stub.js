import {Stubs} from "./stubs";

export class GlobalOperationsStatusesStub extends Stubs {
    static stubGlobalOperationsStatusesResponse(repositoryId, withDelay = 0) {
        GlobalOperationsStatusesStub.stubQueryResponse(`/rest/monitor/${repositoryId}/operations`, '/monitoring/global-operation-statuses.json', 'backup-and-restore-response', withDelay);
    }
}
