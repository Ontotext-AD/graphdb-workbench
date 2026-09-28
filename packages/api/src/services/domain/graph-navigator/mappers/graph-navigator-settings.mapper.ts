import {MapperFn} from '../../../../providers';
import {GraphNavigatorSettings} from '../../../../models/graph-navigator';
import {GraphNavigatorSettingsResponse} from '../response/graph-navigator-settings-response';

/**
 * Maps the {@link GraphNavigatorSettingsResponse} server data to a {@link GraphNavigatorSettings} model.
 * The query preset is carried through as-is, because the diagram consumes it unchanged.
 *
 * @param data - The server response.
 * @returns The mapped {@link GraphNavigatorSettings}.
 */
export const mapGraphNavigatorSettingsResponseToModel: MapperFn<GraphNavigatorSettingsResponse, GraphNavigatorSettings> = (data) => {
  return {...data};
};
