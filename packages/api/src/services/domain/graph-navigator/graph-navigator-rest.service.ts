import {HttpService} from '../../http/http.service';
import {GraphNavigatorSettingsResponse} from './response/graph-navigator-settings-response';
import {RdfVersionUtil} from '../../utils/rdf-version-util';

/**
 * Service for interacting with the graph-navigator REST API
 */
export class GraphNavigatorRestService extends HttpService {
  /**
   * Loads the graph-navigator settings of a repository.
   *
   * @param repositoryId - The id of the repository.
   * @param signal - Optional AbortSignal to cancel the request if needed.
   * @returns A Promise that resolves to the current settings.
   */
  getSettings(repositoryId: string, signal?: AbortSignal): Promise<GraphNavigatorSettingsResponse> {
    return this.get(this.getSettingsEndpoint(repositoryId), {headers: {Accept: 'application/json'}, signal});
  }

  /**
   * Uploads a Turtle settings file for a repository.
   *
   * @param repositoryId - The id of the repository.
   * @param file - The Turtle settings file.
   * @returns A Promise that resolves to the new settings.
   */
  uploadSettings(repositoryId: string, file: File): Promise<GraphNavigatorSettingsResponse> {
    const body = new FormData();
    body.append('settingsFile', file, file.name);
    return this.put(this.getSettingsEndpoint(repositoryId), {body, headers: {Accept: 'application/json'}});
  }

  /**
   * Deletes the graph-navigator settings of a repository, so the defaults are used.
   *
   * @param repositoryId - The id of the repository.
   */
  deleteSettings(repositoryId: string): Promise<void> {
    return this.delete(this.getSettingsEndpoint(repositoryId));
  }

  /**
   * Exports the graph-navigator settings of a repository as Turtle.
   *
   * @param repositoryId - The id of the repository.
   * @returns A Promise that resolves to the settings as Turtle text.
   */
  exportSettings(repositoryId: string): Promise<string> {
    return this.get(this.getSettingsEndpoint(repositoryId), {headers: {Accept: RdfVersionUtil.withVersion('text/turtle')}});
  }

  private getSettingsEndpoint(repositoryId: string): string {
    return `rest/repositories/${this.encodeURIComponentStrict(repositoryId)}/graph-navigator/settings`;
  }
}
