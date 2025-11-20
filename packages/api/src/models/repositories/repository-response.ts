export interface RepositoryResponse {
  readonly id: string;
  readonly title?: string;
  readonly uri: string;
  readonly externalUrl?: string;
  readonly local: boolean;
  readonly type: string;
  readonly sesameType: string;
  readonly location?: string;
  readonly readable: boolean;
  readonly writable: boolean;
  readonly unsupported?: boolean;
  readonly state: string;
}

export type RepositoryListResponse = Record<string, readonly RepositoryResponse[]>;
