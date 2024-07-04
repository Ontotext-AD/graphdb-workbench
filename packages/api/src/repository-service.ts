export class RepositoryService {
    static getRepositories(): Promise<Response> {
        return fetch("http://localhost:9001/rest/repositories/all");
    }
}
