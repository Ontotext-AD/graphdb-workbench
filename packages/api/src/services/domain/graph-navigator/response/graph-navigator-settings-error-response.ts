/**
 * The body of a rejected `repositories/{repositoryId}/graph-navigator/settings` upload.
 */
export interface GraphNavigatorSettingsErrorResponse {
  errors: {
    code: string;
    property: string | null;
    message: string;
    params: Record<string, string>;
    predicate: string | null;
  }[];
}
