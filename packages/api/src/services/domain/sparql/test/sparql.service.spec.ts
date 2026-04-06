import {SparqlService} from '../sparql.service';
import {SavedQuery, SavedQueryList} from '../../../../models/sparql';
import {AuthenticatedUser} from '../../../../models/security';
import {SecurityContextService} from '../../security';
import {service} from '../../../../providers';
import {TestUtil} from '../../../utils/test/test-util';
import {ResponseMock} from '../../../http/test/response-mock';
import {SavedQueryResponse} from '../response/saved-query-response';
import {SaveQueryRequest} from '../request/save-query-request';
import {HttpErrorResponse} from '../../../../models/http';

const SAVED_QUERIES_ENDPOINT = 'rest/sparql/saved-queries';

const savedQueryUrl = (name: string, owner?: string): string => {
  const params = new URLSearchParams({name});
  if (owner) {
    params.set('owner', owner);
  }
  return `${SAVED_QUERIES_ENDPOINT}?${params.toString()}`;
};

const rawQuery = (overrides: Partial<SavedQueryResponse> = {}): SavedQueryResponse => ({
  name: 'my-query',
  body: 'SELECT * WHERE { ?s ?p ?o }',
  owner: 'admin',
  shared: false,
  ...overrides,
});

describe('SparqlService', () => {
  let sparqlService: SparqlService;
  let securityContextService: SecurityContextService;

  beforeEach(() => {
    sparqlService = new SparqlService();
    securityContextService = service(SecurityContextService);
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  describe('getSavedQuery', () => {
    describe('response mapper – empty / falsy responses', () => {
      test('should return an empty SavedQueryList when the API returns null', async () => {
        // Given a null API response
        TestUtil.mockResponse(new ResponseMock(savedQueryUrl('my-query', 'admin')).setResponse(null));

        // When the service fetches the saved query
        const result = await sparqlService.getSavedQuery('my-query', 'admin');

        // Then an empty SavedQueryList should be returned
        expect(result).toBeInstanceOf(SavedQueryList);
        expect(result.getItems()).toHaveLength(0);
      });

      test('should return an empty SavedQueryList when the API returns an empty array', async () => {
        // Given an empty array API response
        TestUtil.mockResponse(new ResponseMock(savedQueryUrl('my-query', 'admin')).setResponse([]));

        // When the service fetches the saved query
        const result = await sparqlService.getSavedQuery('my-query', 'admin');

        // Then an empty SavedQueryList should be returned
        expect(result).toBeInstanceOf(SavedQueryList);
        expect(result.getItems()).toHaveLength(0);
      });
    });

    describe('response mapper – readonly flag based on ownership', () => {
      test('should mark a query as not readonly when the current user is the owner', async () => {
        // Given the current user is the owner of the query
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'admin'}));
        const response = [rawQuery({owner: 'admin'})];
        TestUtil.mockResponse(new ResponseMock(savedQueryUrl('my-query', 'admin')).setResponse(response));

        // When the service fetches the saved query
        const result = await sparqlService.getSavedQuery('my-query', 'admin');
        const query = result.getFirstQuery();

        // Then the query should not be readonly
        expect(query).toBeInstanceOf(SavedQuery);
        expect(query!.readonly).toBe(false);
      });

      test('should mark a query as readonly when the current user is not the owner', async () => {
        // Given the current user is different from the query owner
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'guest'}));
        const response = [rawQuery({owner: 'admin'})];
        TestUtil.mockResponse(new ResponseMock(savedQueryUrl('my-query', 'admin')).setResponse(response));

        // When the service fetches the saved query
        const result = await sparqlService.getSavedQuery('my-query', 'admin');
        const query = result.getFirstQuery();

        // Then the query should be readonly
        expect(query!.readonly).toBe(true);
      });

      test('should mark all queries as readonly when there is no authenticated user', async () => {
        // Given no authenticated user is set
        jest.spyOn(securityContextService, 'getAuthenticatedUser').mockReturnValue(undefined);
        const response = [rawQuery({owner: 'admin'}), rawQuery({name: 'other-query', owner: 'editor'})];
        TestUtil.mockResponse(new ResponseMock(savedQueryUrl('my-query')).setResponse(response));

        // When the service fetches the saved query without an owner
        const result = await sparqlService.getSavedQuery('my-query', '');

        // Then all returned queries should be readonly
        result.getItems().forEach((q) => {
          expect(q.readonly).toBe(true);
        });
      });
    });

    describe('response mapper – field mapping', () => {
      test('should correctly map all fields from the raw response to SavedQuery', async () => {
        // Given a fully populated query response
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'admin'}));
        const raw = rawQuery({name: 'full-query', body: 'ASK { }', owner: 'admin', shared: true});
        TestUtil.mockResponse(new ResponseMock(savedQueryUrl('full-query', 'admin')).setResponse([raw]));

        // When the service fetches the saved query
        const result = await sparqlService.getSavedQuery('full-query', 'admin');
        const query = result.getFirstQuery()!;

        // Then every field should be mapped correctly
        expect(query.queryName).toBe('full-query');
        expect(query.query).toBe('ASK { }');
        expect(query.owner).toBe('admin');
        expect(query.isPublic).toBe(true);
        expect(query.readonly).toBe(false);
      });

      test('should set isPublic to false when shared is false', async () => {
        // Given a private (non-shared) query
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'admin'}));
        const raw = rawQuery({shared: false});
        TestUtil.mockResponse(new ResponseMock(savedQueryUrl('my-query', 'admin')).setResponse([raw]));

        // When the service fetches the saved query
        const result = await sparqlService.getSavedQuery('my-query', 'admin');

        // Then isPublic should be false
        expect(result.getFirstQuery()!.isPublic).toBe(false);
      });

      test('should set isPublic to true when shared is true', async () => {
        // Given a public (shared) query
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'admin'}));
        const raw = rawQuery({shared: true});
        TestUtil.mockResponse(new ResponseMock(savedQueryUrl('my-query', 'admin')).setResponse([raw]));

        // When the service fetches the saved query
        const result = await sparqlService.getSavedQuery('my-query', 'admin');

        // Then isPublic should be true
        expect(result.getFirstQuery()!.isPublic).toBe(true);
      });
    });

    describe('response mapper – multiple queries', () => {
      test('should map all queries in the response and apply correct readonly per owner', async () => {
        // Given the current user is 'alice' and the response contains queries from two different owners
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'alice'}));
        const response = [
          rawQuery({name: 'q1', owner: 'alice'}),
          rawQuery({name: 'q2', owner: 'bob'}),
          rawQuery({name: 'q3', owner: 'alice'}),
        ];
        TestUtil.mockResponse(new ResponseMock(savedQueryUrl('q1')).setResponse(response));

        // When the service fetches the saved query without filtering by owner
        const result = await sparqlService.getSavedQuery('q1', '');

        // Then the list should contain all three queries with correct readonly flags
        expect(result).toBeInstanceOf(SavedQueryList);
        expect(result.getItems()).toHaveLength(3);
        expect(result.getItems()[0].readonly).toBe(false); // owned by alice
        expect(result.getItems()[1].readonly).toBe(true);  // owned by bob
        expect(result.getItems()[2].readonly).toBe(false); // owned by alice
      });
    });

    describe('HTTP request construction', () => {
      test('should include only the name param in the request URL when owner is not provided', async () => {
        // Given a minimal query without an owner
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'admin'}));
        TestUtil.mockResponse(new ResponseMock(savedQueryUrl('my-query')).setResponse([]));

        // When the service fetches the saved query with an empty owner
        await sparqlService.getSavedQuery('my-query', '');

        // Then the request URL should only contain the name parameter
        expect(TestUtil.getRequest(savedQueryUrl('my-query'))).toBeDefined();
      });

      test('should include both name and owner params in the request URL when owner is provided', async () => {
        // Given a query with an explicit owner
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'admin'}));
        TestUtil.mockResponse(new ResponseMock(savedQueryUrl('my-query', 'admin')).setResponse([]));

        // When the service fetches the saved query with the owner
        await sparqlService.getSavedQuery('my-query', 'admin');

        // Then the request URL should contain both name and owner parameters
        expect(TestUtil.getRequest(savedQueryUrl('my-query', 'admin'))).toBeDefined();
      });
    });
  });

  describe('getSavedQueries', () => {
    describe('response mapper – empty / falsy responses', () => {
      test('should return an empty SavedQueryList when the API returns null', async () => {
        // Given a null API response
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setResponse(null));

        // When the service fetches all saved queries
        const result = await sparqlService.getSavedQueries();

        // Then an empty SavedQueryList should be returned
        expect(result).toBeInstanceOf(SavedQueryList);
        expect(result.getItems()).toHaveLength(0);
      });

      test('should return an empty SavedQueryList when the API returns an empty array', async () => {
        // Given an empty array API response
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setResponse([]));

        // When the service fetches all saved queries
        const result = await sparqlService.getSavedQueries();

        // Then an empty SavedQueryList should be returned
        expect(result).toBeInstanceOf(SavedQueryList);
        expect(result.getItems()).toHaveLength(0);
      });
    });

    describe('response mapper – readonly flag based on ownership', () => {
      test('should mark a query as not readonly when the current user is the owner', async () => {
        // Given the current user is the owner of the query
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'admin'}));
        const response = [rawQuery({owner: 'admin'})];
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setResponse(response));

        // When the service fetches all saved queries
        const result = await sparqlService.getSavedQueries();
        const query = result.getFirstQuery();

        // Then the query should not be readonly
        expect(query).toBeInstanceOf(SavedQuery);
        expect(query!.readonly).toBe(false);
      });

      test('should mark a query as readonly when the current user is not the owner', async () => {
        // Given the current user is different from the query owner
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'guest'}));
        const response = [rawQuery({owner: 'admin'})];
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setResponse(response));

        // When the service fetches all saved queries
        const result = await sparqlService.getSavedQueries();
        const query = result.getFirstQuery();

        // Then the query should be readonly
        expect(query!.readonly).toBe(true);
      });

      test('should mark all queries as readonly when there is no authenticated user', async () => {
        // Given no authenticated user is set
        jest.spyOn(securityContextService, 'getAuthenticatedUser').mockReturnValue(undefined);
        const response = [rawQuery({owner: 'admin'}), rawQuery({name: 'other-query', owner: 'editor'})];
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setResponse(response));

        // When the service fetches all saved queries
        const result = await sparqlService.getSavedQueries();

        // Then all returned queries should be readonly
        result.getItems().forEach((q) => {
          expect(q.readonly).toBe(true);
        });
      });
    });

    describe('response mapper – field mapping', () => {
      test('should correctly map all fields from the raw response to SavedQuery', async () => {
        // Given a fully populated query response
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'admin'}));
        const raw = rawQuery({name: 'full-query', body: 'ASK { }', owner: 'admin', shared: true});
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setResponse([raw]));

        // When the service fetches all saved queries
        const result = await sparqlService.getSavedQueries();
        const query = result.getFirstQuery()!;

        // Then every field should be mapped correctly
        expect(query.queryName).toBe('full-query');
        expect(query.query).toBe('ASK { }');
        expect(query.owner).toBe('admin');
        expect(query.isPublic).toBe(true);
        expect(query.readonly).toBe(false);
      });

      test('should set isPublic to false when shared is false', async () => {
        // Given a private (non-shared) query
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'admin'}));
        const raw = rawQuery({shared: false});
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setResponse([raw]));

        // When the service fetches all saved queries
        const result = await sparqlService.getSavedQueries();

        // Then isPublic should be false
        expect(result.getFirstQuery()!.isPublic).toBe(false);
      });

      test('should set isPublic to true when shared is true', async () => {
        // Given a public (shared) query
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'admin'}));
        const raw = rawQuery({shared: true});
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setResponse([raw]));

        // When the service fetches all saved queries
        const result = await sparqlService.getSavedQueries();

        // Then isPublic should be true
        expect(result.getFirstQuery()!.isPublic).toBe(true);
      });
    });

    describe('response mapper – multiple queries', () => {
      test('should map all queries in the response and apply correct readonly per owner', async () => {
        // Given the current user is 'alice' and the response contains queries from two different owners
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'alice'}));
        const response = [
          rawQuery({name: 'q1', owner: 'alice'}),
          rawQuery({name: 'q2', owner: 'bob'}),
          rawQuery({name: 'q3', owner: 'alice'}),
        ];
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setResponse(response));

        // When the service fetches all saved queries
        const result = await sparqlService.getSavedQueries();

        // Then the list should contain all three queries with correct readonly flags
        expect(result).toBeInstanceOf(SavedQueryList);
        expect(result.getItems()).toHaveLength(3);
        expect(result.getItems()[0].readonly).toBe(false); // owned by alice
        expect(result.getItems()[1].readonly).toBe(true);  // owned by bob
        expect(result.getItems()[2].readonly).toBe(false); // owned by alice
      });
    });

    describe('HTTP request construction', () => {
      test('should send a request to the saved-queries endpoint with no query parameters', async () => {
        // Given no query parameters are needed
        securityContextService.updateAuthenticatedUser(new AuthenticatedUser({username: 'admin'}));
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setResponse([]));

        // When the service fetches all saved queries
        await sparqlService.getSavedQueries();

        // Then the request URL should have no extra parameters
        expect(TestUtil.getRequest(SAVED_QUERIES_ENDPOINT)).toBeDefined();
      });
    });
  });

  describe('saveQuery', () => {
    const saveQueryPayload = (overrides: Partial<SaveQueryRequest> = {}): SaveQueryRequest => ({
      name: 'my-query',
      body: 'SELECT * WHERE { ?s ?p ?o }',
      shared: false,
      ...overrides,
    });

    describe('success scenarios', () => {
      test('should resolve successfully when the API returns 200', async () => {
        // Given a successful API response
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setStatus(200).setResponse(null));

        // When saving the query
        // Then it should resolve without throwing
        await expect(sparqlService.saveQuery(saveQueryPayload())).resolves.not.toThrow();
      });

      test('should resolve when saving a public (shared) query', async () => {
        // Given a public query payload
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setStatus(200).setResponse(null));

        // When saving the public query
        // Then it should resolve without throwing
        await expect(sparqlService.saveQuery(saveQueryPayload({shared: true}))).resolves.not.toThrow();
      });

      test('should resolve when saving a private (non-shared) query', async () => {
        // Given a private query payload
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setStatus(200).setResponse(null));

        // When saving the private query
        // Then it should resolve without throwing
        await expect(sparqlService.saveQuery(saveQueryPayload({shared: false}))).resolves.not.toThrow();
      });
    });

    describe('HTTP request construction', () => {
      test('should send a POST request to the saved-queries endpoint', async () => {
        // Given a valid query payload
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setStatus(200).setResponse(null));

        // When saving the query
        await sparqlService.saveQuery(saveQueryPayload());

        // Then the request should be sent to the correct endpoint
        expect(TestUtil.getRequest(SAVED_QUERIES_ENDPOINT)).toBeDefined();
      });

      test('should use the POST HTTP method', async () => {
        // Given a valid query payload
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setStatus(200).setResponse(null));

        // When saving the query
        await sparqlService.saveQuery(saveQueryPayload());

        // Then the request method should be POST
        const request = TestUtil.getRequest(SAVED_QUERIES_ENDPOINT);
        expect(request!.method).toBe('POST');
      });

      test('should serialize the payload as JSON in the request body', async () => {
        // Given a fully specified query payload
        const payload = saveQueryPayload({name: 'test-query', body: 'ASK { }', shared: true});
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setStatus(200).setResponse(null));

        // When saving the query
        await sparqlService.saveQuery(payload);

        // Then the request body should be the JSON-serialized payload
        const request = TestUtil.getRequest(SAVED_QUERIES_ENDPOINT);
        expect(request!.body).toBe(JSON.stringify(payload));
      });

      test('should correctly include all fields (name, body, shared) in the serialized request body', async () => {
        // Given a fully specified query payload
        const payload: SaveQueryRequest = {name: 'full-query', body: 'DESCRIBE ?s', shared: true};
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setStatus(200).setResponse(null));

        // When saving the query
        await sparqlService.saveQuery(payload);

        // Then all fields should be present in the parsed request body
        const request = TestUtil.getRequest(SAVED_QUERIES_ENDPOINT);
        const parsed = JSON.parse(request!.body as string);
        expect(parsed.name).toBe('full-query');
        expect(parsed.body).toBe('DESCRIBE ?s');
        expect(parsed.shared).toBe(true);
      });
    });

    describe('error propagation', () => {
      test('should reject with an HttpErrorResponse on a 4xx response', async () => {
        // Given a 400 API response
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setStatus(400).setMessage('Bad Request'));

        // When saving the query
        // Then it should reject with an HttpErrorResponse
        await expect(sparqlService.saveQuery(saveQueryPayload())).rejects.toBeInstanceOf(HttpErrorResponse);
      });

      test('should include the 4xx status code in the rejected HttpErrorResponse', async () => {
        // Given a 400 API response
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setStatus(400).setMessage('Bad Request'));

        // When saving the query
        try {
          await sparqlService.saveQuery(saveQueryPayload());
          fail('Should have thrown an error');
        } catch (error) {
          // Then the status should match the server response
          expect((error as HttpErrorResponse).status).toBe(400);
        }
      });

      test('should reject with an HttpErrorResponse on a 5xx response', async () => {
        // Given a 500 API response
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setStatus(500).setMessage('Internal Server Error'));

        // When saving the query
        // Then it should reject with an HttpErrorResponse
        await expect(sparqlService.saveQuery(saveQueryPayload())).rejects.toBeInstanceOf(HttpErrorResponse);
      });

      test('should include the 5xx status code in the rejected HttpErrorResponse', async () => {
        // Given a 500 API response
        TestUtil.mockResponse(new ResponseMock(SAVED_QUERIES_ENDPOINT).setStatus(500).setMessage('Internal Server Error'));

        // When saving the query
        try {
          await sparqlService.saveQuery(saveQueryPayload());
          fail('Should have thrown an error');
        } catch (error) {
          // Then the status should match the server response
          expect((error as HttpErrorResponse).status).toBe(500);
        }
      });
    });
  });
});

