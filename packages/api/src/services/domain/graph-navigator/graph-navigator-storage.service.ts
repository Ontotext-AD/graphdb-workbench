import {LocalStorageService} from '../../storage';

/**
 * Service for the Graph Navigator data in local storage: the diagram, which the `graphwise-reactodia` web component
 * writes, and the repository it was drawn in, which the workbench writes.
 */
export class GraphNavigatorStorageService extends LocalStorageService {
  readonly NAMESPACE = 'graphNavigator';
  private readonly DIAGRAM_KEY = 'diagram';
  private readonly DIAGRAM_REPOSITORY_KEY = 'diagramRepository';

  /**
   * Stores the value under the key, in the Graph Navigator namespace.
   *
   * @param key The key, without the namespace.
   * @param value The value.
   */
  set(key: string, value: string): void {
    this.storeValue(key, value);
  }

  /**
   * The full local storage key of the diagram, for the web component's `config.storageKey`.
   *
   * @returns The key, in the workbench namespace.
   */
  getDiagramStorageKey(): string {
    return this.getPrefixedKey(this.DIAGRAM_KEY);
  }

  /**
   * Whether a diagram is stored. The web component removes the diagram when it has no elements.
   *
   * @returns `true` when a diagram is stored.
   */
  hasDiagram(): boolean {
    return this.get(this.DIAGRAM_KEY).getValue() !== null;
  }

  /**
   * Removes the stored diagram.
   */
  removeDiagram(): void {
    this.remove(this.DIAGRAM_KEY);
  }

  /**
   * The repository the stored diagram was drawn in.
   *
   * @returns The repository, or `null` when none is stored.
   */
  getDiagramRepository(): string | null {
    return this.get(this.DIAGRAM_REPOSITORY_KEY).getValue();
  }

  /**
   * Records the repository the diagram on the canvas belongs to.
   *
   * @param repositoryId The repository.
   */
  setDiagramRepository(repositoryId: string): void {
    this.set(this.DIAGRAM_REPOSITORY_KEY, repositoryId);
  }
}
