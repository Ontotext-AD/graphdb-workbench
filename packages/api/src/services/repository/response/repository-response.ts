export type RepositoryListResponse = Record<string, RepositoryResponse[]>;

export interface RepositoryResponse {
  id: string;
  title: string;
  uri: string;
  externalUrl: string;
  local: boolean;
  type: string;
  sesameType: string;
  location: string;
  readable: boolean;
  writable: boolean;
  unsupported: boolean;
  state: string;
}
