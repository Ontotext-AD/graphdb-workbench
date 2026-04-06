import {Rdf4jRepositoryService} from '../rdf4j-repository.service';
import {Rdf4jRestService} from '../rdf4j-rest.service';
import {ServiceProvider} from '../../../../providers';
import {TestUtil} from '../../../utils/test/test-util';
import {ResponseMock} from '../../../http/test/response-mock';

describe('Rdf4jRepositoryService', () => {
  let rdf4jRepositoryService: Rdf4jRepositoryService;

  beforeEach(() => {
    ServiceProvider['SERVICE_INSTANCES'].clear();
    rdf4jRepositoryService = new Rdf4jRepositoryService();
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
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

  describe('downloadResultsAsFile', () => {
    test('should call the correct endpoint with the correct request headers', async () => {
      // Given a repository ID, data, accept header, and link header
      const repositoryId = 'my-repository';
      const data = {query: 'SELECT * WHERE { ?s ?p ?o }', infer: true};
      const acceptHeader = 'application/sparql-results+json';
      const linkHeader = '<http://example.org>; rel="related"';
      const mockBlob = new Blob(['{}'], {type: 'application/json'});
      TestUtil.mockResponse(new ResponseMock(`repositories/${repositoryId}`).setBlob(mockBlob));

      // When I call downloadResultsAsFile
      await rdf4jRepositoryService.downloadResultsAsFile(repositoryId, data, acceptHeader, linkHeader);

      // Then fetch should have been called with the correct URL and headers
      const request = TestUtil.getRequest(`repositories/${repositoryId}`);
      expect(request).toBeDefined();
      expect((request!.headers as Record<string, string>)['Accept']).toBe(acceptHeader);
      expect((request!.headers as Record<string, string>)['Link']).toBe(linkHeader);
    });

    test('should return the file Blob and the filename from the Content-Disposition header', async () => {
      // Given a response with a Content-Disposition header containing a filename
      const repositoryId = 'my-repository';
      const mockBlob = new Blob(['result data'], {type: 'text/csv'});
      TestUtil.mockResponse(
        new ResponseMock(`repositories/${repositoryId}`)
          .setBlob(mockBlob)
          .setHeaders(new Headers({'content-disposition': 'attachment; filename="results.csv"'}))
      );

      // When I call downloadResultsAsFile
      const result = await rdf4jRepositoryService.downloadResultsAsFile(repositoryId, {}, 'text/csv', '');

      // Then the returned object should contain the Blob and the extracted filename
      expect(result.data).toBe(mockBlob);
      expect(result.filename).toBe('results.csv');
    });

    test('should return the default filename "download" when no Content-Disposition header is present', async () => {
      // Given a response without a Content-Disposition header
      const repositoryId = 'my-repository';
      const mockBlob = new Blob(['result data'], {type: 'application/json'});
      TestUtil.mockResponse(new ResponseMock(`repositories/${repositoryId}`).setBlob(mockBlob));

      // When I call downloadResultsAsFile
      const result = await rdf4jRepositoryService.downloadResultsAsFile(repositoryId, {}, 'application/json', '');

      // Then the returned filename should be the default "download"
      expect(result.data).toBe(mockBlob);
      expect(result.filename).toBe('download');
    });

    test('should strip quotes from the filename in the Content-Disposition header', async () => {
      // Given a response where the filename in Content-Disposition is wrapped in quotes
      const repositoryId = 'my-repository';
      const mockBlob = new Blob(['data'], {type: 'application/octet-stream'});
      TestUtil.mockResponse(
        new ResponseMock(`repositories/${repositoryId}`)
          .setBlob(mockBlob)
          .setHeaders(new Headers({'content-disposition': 'attachment; filename=\'report.tsv\''}))
      );

      // When I call downloadResultsAsFile
      const result = await rdf4jRepositoryService.downloadResultsAsFile(repositoryId, {}, 'text/tab-separated-values', '');

      // Then the filename should have quotes stripped
      expect(result.filename).toBe('report.tsv');
    });
  });
});

