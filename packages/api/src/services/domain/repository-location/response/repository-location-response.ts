export interface RepositoryLocationResponse {
  uri: string,
  label: string,
  username: string | null,
  password: string | null,
  authType: string | null,
  locationType: string | null,
  defaultRepository: string | null
  active: boolean,
  local: boolean,
  system: boolean,
  errorMsg: string | null,
}
