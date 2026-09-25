import {RdfVersionUtil} from '../rdf-version-util';

describe('RdfVersionUtil', () => {
  describe('withVersion', () => {
    test('should add the version to a single media type', () => {
      expect(RdfVersionUtil.withVersion('text/turtle')).toBe('text/turtle;version=1.2');
    });

    test('should add the version to every media range of a multi-value header', () => {
      const accept = 'application/x-sparqlstar-results+json, application/sparql-results+json;q=0.9, */*;q=0.8';

      expect(RdfVersionUtil.withVersion(accept))
        .toBe('application/x-sparqlstar-results+json;version=1.2, application/sparql-results+json;version=1.2;q=0.9, */*;version=1.2;q=0.8');
    });

    test('should place the version after the media type parameters and before the weight', () => {
      expect(RdfVersionUtil.withVersion('text/turtle;charset=utf-8;q=0.5'))
        .toBe('text/turtle;charset=utf-8;version=1.2;q=0.5');
    });

    test('should not add the version twice', () => {
      const accept = 'application/sparql-results+json;version=1.2;q=0.9, */*;q=0.8';
      const expected = 'application/sparql-results+json;version=1.2;q=0.9, */*;version=1.2;q=0.8';

      expect(RdfVersionUtil.withVersion(accept)).toBe(expected);
      expect(RdfVersionUtil.withVersion(RdfVersionUtil.withVersion(accept))).toBe(expected);
    });

    test('should not add the version to non-RDF media types', () => {
      expect(RdfVersionUtil.withVersion('application/json, */*'))
        .toBe('application/json, */*;version=1.2');
    });

    test('should add the version to text/plain, because it is the N-Triples media type', () => {
      expect(RdfVersionUtil.withVersion('text/plain')).toBe('text/plain;version=1.2');
    });

    test('should return empty values unchanged', () => {
      expect(RdfVersionUtil.withVersion(undefined)).toBeUndefined();
      expect(RdfVersionUtil.withVersion('')).toBe('');
    });
  });
});
