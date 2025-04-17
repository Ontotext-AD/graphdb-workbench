import {Mapper} from '../../../providers/mapper/mapper';
import {NamespaceMap} from '../../../models/repositories/namespace/namespace-map';
import {NamespacesResponse} from '../../../models/repositories/namespace/api/namespaces-response';

/**
 * Mapper class for converting namespace API responses to a model list of namespaces.
 */
export class NamespaceMapMapper extends Mapper<NamespaceMap> {
  /**
   * Maps the raw API response data to a structured map of namespaces and their URIs.
   *
   * @param data - The raw namespace response data from the API containing bindings with prefix and namespace values
   * @returns A NamespaceMap containing a mapping between prefixes and their corresponding URIs.
   */
  mapToModel(data: NamespacesResponse): NamespaceMap {
    const namespaces = data?.results.bindings || [];
    return new NamespaceMap(namespaces.reduce((acc, binding) => {
      const prefix = binding.prefix.value;
      acc[prefix] = binding.namespace.value;
      return acc;
    }, {} as Record<string, string>));
  }
}
