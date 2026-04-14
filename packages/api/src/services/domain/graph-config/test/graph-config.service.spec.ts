import {GraphConfigService} from '../graph-config.service';
import {TestUtil} from '../../../utils/test/test-util';
import {ResponseMock} from '../../../http/test/response-mock';
import {GraphConfigList} from '../../../../models/graph-config/graph-config-list';

describe('GraphConfigService', () => {
  let graphConfigService: GraphConfigService;

  beforeEach(() => {
    graphConfigService = new GraphConfigService();
  });

  describe('getGraphConfigs', () => {
    it('should return an empty GraphConfigList when no graph configs are returned', async () => {
      // WHEN: I call get graph configs endpoint that doesn't return any graph configs.
      mockGraphConfigResponse(undefined);
      const response = await graphConfigService.getGraphConfigs();

      // THEN: I expect an empty instance of GraphConfigList.
      expect(response).toBeInstanceOf(GraphConfigList);
      expect(response.getItems()).toHaveLength(0);
    });
  });

  it('should return Graph configurations', async () => {
    // WHEN: I call get graph configs endpoint that returns graph configs.
    const responseData = [{
      'id': 'de99fd5de7f94ef98f1875dff55fc1c9',
      'name': 'Graph Config 1',
      'startMode': 'query',
      'owner': 'admin',
      'startQueryIncludeInferred': true,
      'startQuerySameAs': true,
      'startGraphQuery': '# CONSTRUCT or DESCRIBE query. The results will be rendered visually as a graph of triples.\nCONSTRUCT WHERE {\n\t?s ?p ?o\n} LIMIT 10',
      'startIRI': null,
      'startIRILabel': null,
      'expandQuery': null,
      'resourceQuery': null,
      'predicateLabelQuery': null,
      'resourcePropertiesQuery': null,
      'shared': false,
      'description': null,
      'hint': null,
      'repositoryId': 'A_test'
    },
    {
      'id': '94cab6579df445c68c454b2156013811',
      'name': 'Graph Config 1',
      'owner': 'admin',
      'startGraphQuery': '# CONSTRUCT or DESCRIBE query. The results will be rendered visually as a graph of triples.\nCONSTRUCT WHERE {\n\t?s ?p ?o\n} LIMIT 10',
      'startIRI': null,
      'startIRILabel': null,
      'expandQuery': null,
      'resourceQuery': null,
      'predicateLabelQuery': null,
      'resourcePropertiesQuery': null,
      'description': null,
      'hint': null,
      'repositoryId': null
    }];
    mockGraphConfigResponse(responseData);
    const response = await graphConfigService.getGraphConfigs();

    // THEN: I expect an instance of GraphConfigList,
    expect(response).toBeInstanceOf(GraphConfigList);
    // containing graph configurations returned from the response.
    expect(response.getItems()).toHaveLength(2);
    expect(response.getItems()[0].id).toBe('de99fd5de7f94ef98f1875dff55fc1c9');
    expect(response.getItems()[1].id).toBe('94cab6579df445c68c454b2156013811');
    // AND: I expect default values for properties that are not present in the response.
    expect(response.getItems()[1].startMode).toBe('search');
    expect(response.getItems()[1].shared).toBeFalsy();
    expect(response.getItems()[1].startQueryIncludeInferred).toBeTruthy();
    expect(response.getItems()[1].startQuerySameAs).toBeTruthy();
  });
});

const mockGraphConfigResponse = (data: unknown) =>
  TestUtil.mockResponse(
    new ResponseMock('rest/explore-graph/config').setResponse(data)
  );
