import {Stubs} from "./stubs";

export class GlobalOperationsStatusesStub extends Stubs {
    static stubGlobalOperationsStatusesResponse(repositoryId, withDelay = 0) {
        GlobalOperationsStatusesStub.stubQueryResponse(`/rest/monitor/repository/${repositoryId}/operations`, '/monitoring/global-operation-statuses.json', 'backup-and-restore-response', withDelay);
    }

    static stubNoOperationsResponse(repositoryId, withDelay = 0) {
        GlobalOperationsStatusesStub.stubQueryResponse(
            `/rest/monitor/repository/${repositoryId}/operations`,
            '/monitoring/no-operations.json',
            'backup-and-restore-response', withDelay);
    }
}
