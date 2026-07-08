import {GraphExploreService} from '../graph-explore.service';
import {GraphExploreRestService} from '../graph-explore-rest.service';
import {DEFAULT_GRAPH_EXPLORE_SETTINGS} from '../graph-explore-settings.config';
import {service} from '../../../../providers';
import {GraphExploreLink} from '../../../../models/graph-explore';

describe('GraphExploreService', () => {
  const QUERY = 'CONSTRUCT WHERE { ?s ?p ?o }';
  let graphExploreService: GraphExploreService;
  let loadGraphSpy: jest.SpyInstance;

  beforeEach(() => {
    graphExploreService = new GraphExploreService();
    loadGraphSpy = jest.spyOn(service(GraphExploreRestService), 'loadGraph').mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loadGraphForQuery', () => {
    it('should call the rest service with the explicit flags without overriding false', async () => {
      // WHEN: explicit inference and sameAs flags are provided.
      await graphExploreService.loadGraphForQuery(QUERY, true, false);

      // THEN: the flags are forwarded as-is; an explicit false is not replaced by the default.
      expect(loadGraphSpy).toHaveBeenCalledWith({
        query: QUERY,
        linksLimit: DEFAULT_GRAPH_EXPLORE_SETTINGS.linksLimit,
        languages: DEFAULT_GRAPH_EXPLORE_SETTINGS.languages,
        includeInferred: true,
        sameAsState: false,
      });
    });

    it('should fall back to the default settings when the flags are omitted', async () => {
      // WHEN: no inference or sameAs flags are provided.
      await graphExploreService.loadGraphForQuery(QUERY);

      // THEN: the request is built entirely from the default settings.
      expect(loadGraphSpy).toHaveBeenCalledWith({
        query: QUERY,
        linksLimit: DEFAULT_GRAPH_EXPLORE_SETTINGS.linksLimit,
        languages: DEFAULT_GRAPH_EXPLORE_SETTINGS.languages,
        includeInferred: DEFAULT_GRAPH_EXPLORE_SETTINGS.includeInferred,
        sameAsState: DEFAULT_GRAPH_EXPLORE_SETTINGS.sameAs,
      });
    });

    it('should map the response links to GraphExploreLink instances', async () => {
      // GIVEN: the rest service returns links.
      loadGraphSpy.mockResolvedValue([
        {source: 'urn:a', target: 'urn:b', predicates: ['urn:p1', 'urn:p2'], rawPredicates: ['p1', 'p2']},
        {source: 'urn:b', target: 'urn:c', predicates: ['urn:p3'], rawPredicates: ['p3']},
      ]);

      // WHEN: the graph is loaded.
      const links = await graphExploreService.loadGraphForQuery(QUERY, true, false);

      // THEN: each link is mapped to a GraphExploreLink carrying the full predicate IRIs.
      expect(links).toHaveLength(2);
      expect(links[0]).toBeInstanceOf(GraphExploreLink);
      expect(links[0].source).toBe('urn:a');
      expect(links[0].target).toBe('urn:b');
      expect(links[0].predicates).toEqual(['urn:p1', 'urn:p2']);
      expect(links[0].rawPredicates).toEqual(['p1', 'p2']);
      expect(links[1].predicates).toEqual(['urn:p3']);
      expect(links[1].rawPredicates).toEqual(['p3']);
    });

    it('should return an empty list when the response has no links', async () => {
      // GIVEN: the rest service returns no links.
      loadGraphSpy.mockResolvedValue([]);

      // WHEN: the graph is loaded.
      const links = await graphExploreService.loadGraphForQuery(QUERY, false, false);

      // THEN: the result is an empty list.
      expect(links).toHaveLength(0);
    });
  });
});
