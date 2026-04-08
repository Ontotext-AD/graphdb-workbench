export interface QueryResponse {
  body: number | QueryResponseData
}

export interface QueryResponseData {
  results: {
    bindings: never[]
  }
  totalElements: {}
}
