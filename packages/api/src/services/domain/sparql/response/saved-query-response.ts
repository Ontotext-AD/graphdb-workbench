export interface SavedQueryResponse {
  name: string;
  owner: string;
  body: string;
  shared: boolean;
}

export type SavedQueryListResponse = SavedQueryResponse[];
