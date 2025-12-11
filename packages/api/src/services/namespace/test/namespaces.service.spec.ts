import {NamespacesService} from '../namespaces.service';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {NamespaceMap} from '../../../models/namespace';

describe('Namespaces Service', () => {
  let namespacesService: NamespacesService;

  beforeEach(() => {
    namespacesService = new NamespacesService();
  });

  test('getNamespaces should return a NamespaceMap', async () => {
    // Given, I have mocked the response from the RDF4J repository
    const namespaces = {
      head: {
        vars: [
          'prefix',
          'namespace'
        ]
      },
      results: {
        bindings: [
          {
            prefix: {
              type: 'literal',
              value: 'agg'
            },
            namespace: {
              type: 'literal',
              value: 'http://jena.apache.org/ARQ/function/aggregate#'
            }
          },
          {
            prefix: {
              type: 'literal',
              value: 'sail'
            },
            namespace: {
              type: 'literal',
              value: 'http://www.openrdf.org/config/sail#'
            }
          },
        ]
      }
    };
    const repositoryId = 'repository-id';
    TestUtil.mockResponse(new ResponseMock(`repositories/${repositoryId}/namespaces`).setResponse(namespaces));

    // When I call the getNamespaces method with the repository ID
    const result = await namespacesService.getNamespaces(repositoryId);

    // Then, I expect the result to be a NamespaceMap with the expected namespaces
    expect(result).toBeInstanceOf(NamespaceMap);
  });
});
