export class RepositoryService {
    static getRepositories(): Promise<Response> {
        return fetch("http://localhost:9000/rest/repositories/all");
    }
}
