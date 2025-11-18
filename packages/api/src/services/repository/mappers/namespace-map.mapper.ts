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
  mapToModel(data: NamespacesResponse | NamespaceMap): NamespaceMap {
    if (data instanceof NamespaceMap) {
      return data;
    }

    const bindings = data.results?.bindings ?? [];

    const map = bindings.reduce<Record<string, string>>((acc, binding) => {
      const prefix = binding.prefix?.value;
      const ns = binding.namespace?.value;
      if (prefix && ns) {
        acc[prefix] = ns;
      }
      return acc;
    }, {});

    return new NamespaceMap(map);
  }
}
