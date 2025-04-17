import {NamespaceMapMapper} from '../namespace-map.mapper';
import {NamespacesResponse} from '../../../../models/repositories/namespace/api/namespaces-response';

describe('Namespace Map Mapper', () => {
  let mapper: NamespaceMapMapper;
  beforeEach(() => {
    mapper = new NamespaceMapMapper();
  });

  test('should correctly map an array of Namespace objects', () => {
    // Given, I have an array of Namespace objects.
    const namespacesResponse = {
      results: {
        bindings: [
          {prefix: {value: 'example'}, namespace: {value: 'http://example.com/'}},
          {prefix: {value: 'yet-another'}, namespace: {value: 'http://yet-another.com/'}},
          {prefix: {value: 'another'}, namespace: {value: 'http://another.com/'}}
        ]
      }
    } as NamespacesResponse;

    const expected: Record<string, string> = {
      example: 'http://example.com/',
      'yet-another': 'http://yet-another.com/',
      another: 'http://another.com/'
    };

    // When, I map the raw API response data to the namespaces map model.
    const actual = mapper.mapToModel(namespacesResponse);

    // Then, I expect the model to contain a mapping of prefixes to their corresponding URIs,
    Object.keys(expected).forEach((key) => {
      expect(actual.getByPrefix(key)).toEqual(expected[key]);
    });
  });
});
