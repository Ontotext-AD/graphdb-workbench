import {Stubs} from "../stubs";

export class RepositoriesStubs extends Stubs {
    static stubRepositories(withDelay = 0) {
        RepositoriesStubs.stubQueryResponse('/rest/repositories/all', '/repositories/get-repositories.json', 'backup-and-restore-response', withDelay);
    }

    static stubLocations(withDelay = 0) {
        RepositoriesStubs.stubQueryResponse('/rest/locations?filterClusterLocations=true', '/repositories/get-locations.json', 'backup-and-restore-response', withDelay);
    }
}
