import {LocalStorageService} from '../../storage';

/**
 * Service for the Graph Navigator data in local storage: the diagram, which the `graphwise-reactodia` web component
 * writes, and the repository and the user it was drawn by, which the workbench writes.
 */
export class GraphNavigatorStorageService extends LocalStorageService {
  readonly NAMESPACE = 'graphNavigator';
  private readonly DIAGRAM_KEY = 'diagram';
  private readonly DIAGRAM_REPOSITORY_ID_KEY = 'diagramRepositoryId';
  private readonly DIAGRAM_USERNAME_KEY = 'diagramUsername';

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
   * The ID of the repository the stored diagram was drawn in.
   *
   * @returns The repository ID, or `null` when none is stored.
   */
  getDiagramRepositoryId(): string | null {
    return this.get(this.DIAGRAM_REPOSITORY_ID_KEY).getValue();
  }

  /**
   * Records the ID of the repository the diagram on the canvas belongs to.
   *
   * @param repositoryId The repository ID.
   */
  setDiagramRepositoryId(repositoryId: string): void {
    this.set(this.DIAGRAM_REPOSITORY_ID_KEY, repositoryId);
  }

  /**
   * The username of the user who drew the stored diagram.
   *
   * @returns The username, or `null` when none is stored.
   */
  getDiagramUsername(): string | null {
    return this.get(this.DIAGRAM_USERNAME_KEY).getValue();
  }

  /**
   * Records the username of the user the diagram on the canvas belongs to.
   *
   * @param username The username. Empty when security is off.
   */
  setDiagramUsername(username: string): void {
    this.set(this.DIAGRAM_USERNAME_KEY, username);
  }
}
