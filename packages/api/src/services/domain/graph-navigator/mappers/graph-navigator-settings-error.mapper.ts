import {MapperFn} from '../../../../providers';
import {GraphNavigatorSettingsError} from '../../../../models/graph-navigator';
import {GraphNavigatorSettingsErrorResponse} from '../response/graph-navigator-settings-error-response';

/**
 * Maps the errors of a {@link GraphNavigatorSettingsErrorResponse} to {@link GraphNavigatorSettingsError} models.
 *
 * @param data - The body of the rejected upload. It may be missing or have no errors.
 * @returns The mapped errors, or an empty array when there are none.
 */
export const mapGraphNavigatorSettingsErrorResponseToModel: MapperFn<GraphNavigatorSettingsErrorResponse | null, GraphNavigatorSettingsError[]> = (data) => {
  return (data?.errors ?? []).map((error) => new GraphNavigatorSettingsError({
    code: error.code,
    property: error.property ?? undefined,
    message: error.message,
    params: {...error.params},
    predicate: error.predicate ?? undefined
  }));
};
