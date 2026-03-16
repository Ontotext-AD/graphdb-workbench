import {Rdf4jRepositoryService} from '../rdf4j-repository.service';
import {Rdf4jRestService} from '../rdf4j-rest.service';
import {ServiceProvider} from '../../../../providers';

describe('Rdf4jRepositoryService', () => {
  let rdf4jRepositoryService: Rdf4jRepositoryService;

  beforeEach(() => {
    ServiceProvider['SERVICE_INSTANCES'].clear();
    rdf4jRepositoryService = new Rdf4jRepositoryService();
  });

  describe('getStatementsEndpoint', () => {
    test('should return the statements endpoint URL for the given repository ID', () => {
      // Given a repository ID
      const repositoryId = 'my-repository';

      // When I call getStatementsEndpoint
      const result = rdf4jRepositoryService.getStatementsEndpoint(repositoryId);

      // Then I expect the correct endpoint URL to be returned
      expect(result).toBe('repositories/my-repository/statements');
    });

    test('should delegate to Rdf4jRestService.getStatementsEndpoint', () => {
      // Given a repository ID and a spy on the underlying REST service
      const repositoryId = 'test-repo';
      const restService = ServiceProvider.get(Rdf4jRestService);
      const spy = jest.spyOn(restService, 'getStatementsEndpoint');

      // When I call getStatementsEndpoint
      rdf4jRepositoryService.getStatementsEndpoint(repositoryId);

      // Then the REST service method should have been called with the repository ID
      expect(spy).toHaveBeenCalledWith(repositoryId);
    });
  });

  describe('getSparqlEndpoint', () => {
    test('should return the SPARQL endpoint URL for the given repository ID', () => {
      // Given a repository ID
      const repositoryId = 'my-repository';

      // When I call getSparqlEndpoint
      const result = rdf4jRepositoryService.getSparqlEndpoint(repositoryId);

      // Then I expect the correct endpoint URL to be returned
      expect(result).toBe('repositories/my-repository');
    });

    test('should delegate to Rdf4jRestService.getSparqlEndpoint', () => {
      // Given a repository ID and a spy on the underlying REST service
      const repositoryId = 'test-repo';
      const restService = ServiceProvider.get(Rdf4jRestService);
      const spy = jest.spyOn(restService, 'getSparqlEndpoint');

      // When I call getSparqlEndpoint
      rdf4jRepositoryService.getSparqlEndpoint(repositoryId);

      // Then the REST service method should have been called with the repository ID
      expect(spy).toHaveBeenCalledWith(repositoryId);
    });
  });
});

