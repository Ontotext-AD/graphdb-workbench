import {NamespaceResponse} from './namespace-response';

export interface NamespacesResponse {
  results: {
    bindings: NamespaceResponse[];
  }
}

