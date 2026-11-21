import {GraphNavigatorStorageService} from '../graph-navigator-storage.service';

const DIAGRAM_KEY = 'ontotext.gdb.graphNavigator.diagram';
const DIAGRAM_REPOSITORY_KEY = 'ontotext.gdb.graphNavigator.diagramRepository';

describe('GraphNavigatorStorageService', () => {
  let service: GraphNavigatorStorageService;

  beforeEach(() => {
    service = new GraphNavigatorStorageService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('should give the diagram key in the workbench namespace', () => {
    // When the diagram key is read
    // Then it is in the Graph Navigator namespace
    expect(service.getDiagramStorageKey()).toEqual(DIAGRAM_KEY);
  });

  test('should tell whether a diagram is stored', () => {
    // Given no stored diagram
    // Then there is no diagram
    expect(service.hasDiagram()).toBe(false);

    // When the web component stores a diagram
    localStorage.setItem(DIAGRAM_KEY, '{}');

    // Then there is a diagram
    expect(service.hasDiagram()).toBe(true);
  });

  test('should remove the stored diagram', () => {
    // Given a stored diagram
    localStorage.setItem(DIAGRAM_KEY, '{}');

    // When it is removed
    service.removeDiagram();

    // Then nothing is stored
    expect(localStorage.getItem(DIAGRAM_KEY)).toBeNull();
  });

  test('should store the repository of the diagram', () => {
    // Given no stored repository
    // Then none is returned
    expect(service.getDiagramRepository()).toBeNull();

    // When the repository is recorded
    service.setDiagramRepository('repo-a');

    // Then it is stored in the Graph Navigator namespace
    expect(localStorage.getItem(DIAGRAM_REPOSITORY_KEY)).toEqual('repo-a');
    expect(service.getDiagramRepository()).toEqual('repo-a');
  });
});
