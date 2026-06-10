export type LocationListResponse = LocationResponse[];

export interface LocationResponse {
  uri: string,
  label: string,
  username: string | null,
  password: string | null,
  authType: string,
  locationType: string,
  defaultRepository: string | null
  active: boolean,
  local: boolean,
  system: boolean,
  errorMsg: string | null,
}
