import {Mapper} from '../../../providers/mapper/mapper';
import {NamespaceMap} from '../../../models/repositories/namespace/namespace-map';
import {NamespacesResponse} from '../../../models/repositories/namespace/api/namespaces-response';
import { toObject, ensureArray } from '../../../providers/mapper/guards';

// Shape of each binding item from the namespaces response.
interface NamespaceBinding {
  prefix?: { value?: string };
  namespace?: { value?: string };
}

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
  mapToModel(data: unknown): NamespaceMap {
    if (data instanceof NamespaceMap) {
      return data;
    }

    const src = toObject<NamespacesResponse>(data);
    const bindings = ensureArray<NamespaceBinding>(src.results?.bindings);

    const map = bindings.reduce<Record<string, string>>((acc, b) => {
      const prefix = b.prefix?.value;
      const ns = b.namespace?.value;
      if (prefix && ns) {
        acc[prefix] = ns;
      }
      return acc;
    }, {});

    return new NamespaceMap(map);
  }
}
