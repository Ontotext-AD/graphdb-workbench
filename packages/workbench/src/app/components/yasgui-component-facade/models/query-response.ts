export interface QueryResponse {
  body: number | QueryResponseData
}

export interface TextArrayResponse {
  'http://www.ontotext.com/'?: {
    'http://www.ontotext.com/'?: { value: string | number }[];
  };
}

export interface NumericHolder {
  value: number;
}

export interface QueryResponseData {
  results: {
    bindings: Record<string, unknown>[]
  };
  head: {
    vars: string[];
  }
  /**
   * This property is used to store the total number of elements in the response, which is used for pagination.
   * The type string is not a mistake!
   */
  // TODO: the typing now permits undefined value here, but maybe it's better to always fallback to string, e.g. '0'
  totalElements?: string;
}
