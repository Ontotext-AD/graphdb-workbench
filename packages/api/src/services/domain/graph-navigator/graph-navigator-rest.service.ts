/* eslint-disable @typescript-eslint/no-unused-vars -- TODO: GDB-15242 remove together with the stubs. */
import {HttpService} from '../../http/http.service';
import {GraphNavigatorSettingsResponse} from './response/graph-navigator-settings-response';
import {DEFAULT_SETTINGS_STUB, SETTINGS_TURTLE_STUB} from './graph-navigator-settings.stub';

/**
 * Service for interacting with the graph-navigator REST API: `repositories/{repositoryId}/graph-navigator/settings`.
 */
export class GraphNavigatorRestService extends HttpService {
  /**
   * Loads the graph-navigator settings of a repository.
   *
   * @param repositoryId - The id of the repository.
   * @returns A Promise that resolves to the current settings.
   */
  getSettings(repositoryId: string): Promise<GraphNavigatorSettingsResponse> {
    // TODO: GDB-15242 replace the stub with a GET to the settings endpoint with `Accept: application/json`.
    return Promise.resolve({...DEFAULT_SETTINGS_STUB, uploaded: false});
  }

  /**
   * Uploads a Turtle settings file for a repository.
   *
   * @param repositoryId - The id of the repository.
   * @param file - The Turtle settings file.
   * @returns A Promise that resolves to the new settings.
   */
  uploadSettings(repositoryId: string, file: File): Promise<GraphNavigatorSettingsResponse> {
    // TODO: GDB-15242 replace the stub with a multipart PUT to the settings endpoint, with the file in
    //  the `settingsFile` part and `Accept: application/json`.
    return Promise.resolve({...DEFAULT_SETTINGS_STUB, uploaded: true});
  }

  /**
   * Deletes the graph-navigator settings of a repository, so the defaults are used.
   *
   * @param repositoryId - The id of the repository.
   */
  deleteSettings(repositoryId: string): Promise<void> {
    // TODO: GDB-15242 replace the stub with a DELETE to the settings endpoint.
    return Promise.resolve();
  }

  /**
   * Exports the graph-navigator settings of a repository as Turtle.
   *
   * @param repositoryId - The id of the repository.
   * @returns A Promise that resolves to the settings as Turtle text.
   */
  exportSettings(repositoryId: string): Promise<string> {
    // TODO: GDB-15242 replace the stub with a GET to the settings endpoint with `Accept: text/turtle`.
    return Promise.resolve(SETTINGS_TURTLE_STUB);
  }
}
