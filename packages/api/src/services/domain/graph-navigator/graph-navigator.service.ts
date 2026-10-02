import {GraphNavigatorSettings} from '../../../models/graph-navigator';
import {GraphNavigatorRestService} from './graph-navigator-rest.service';
import {mapGraphNavigatorSettingsResponseToModel} from './mappers/graph-navigator-settings.mapper';
import {service} from '../../../providers';
import {Service} from '../../../providers/service/service';

/**
 * Service for managing the per-repository graph-navigator settings, which configure how the diagram
 * resolves types, labels and links.
 */
export class GraphNavigatorService implements Service {
  private readonly graphNavigatorRestService = service(GraphNavigatorRestService);

  /**
   * Loads the settings of a repository.
   *
   * @param repositoryId - The id of the repository.
   * @returns A Promise that resolves to the current settings.
   */
  async getSettings(repositoryId: string): Promise<GraphNavigatorSettings> {
    const response = await this.graphNavigatorRestService.getSettings(repositoryId);
    return mapGraphNavigatorSettingsResponseToModel(response);
  }

  /**
   * Uploads a Turtle settings file for a repository.
   *
   * @param repositoryId - The id of the repository.
   * @param file - The Turtle settings file.
   * @returns A Promise that resolves to the new settings.
   */
  async uploadSettings(repositoryId: string, file: File): Promise<GraphNavigatorSettings> {
    const response = await this.graphNavigatorRestService.uploadSettings(repositoryId, file);
    return mapGraphNavigatorSettingsResponseToModel(response);
  }

  /**
   * Deletes the settings of a repository, so the defaults are used.
   *
   * @param repositoryId - The id of the repository.
   */
  deleteSettings(repositoryId: string): Promise<void> {
    return this.graphNavigatorRestService.deleteSettings(repositoryId);
  }

  /**
   * Exports the settings of a repository as Turtle.
   *
   * @param repositoryId - The id of the repository.
   * @returns A Promise that resolves to the settings as Turtle text.
   */
  exportSettings(repositoryId: string): Promise<string> {
    return this.graphNavigatorRestService.exportSettings(repositoryId);
  }
}
