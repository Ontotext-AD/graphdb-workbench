export interface QueryRequest {
  _data: {
    query: string;
    queryMode: string;
    queryType?: string;
    pageSize?: string;
    pageNumber?: string;
    offset?: number;
    limit?: number;
    count?: number;
  }
}
