import {NamespaceMap} from '../../../models/repositories/namespace/namespace-map';
import {NamespacesResponse} from '../../../models/repositories/namespace/api/namespaces-response';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper class for converting namespace API responses to a model list of namespaces.
 */
export const mapNamespaceResponseToModel: MapperFn<NamespacesResponse, NamespaceMap> = (data) => {
  const namespaces = data?.results.bindings || [];
  return new NamespaceMap(namespaces.reduce((acc, binding) => {
    const prefix = binding.prefix.value;
    acc[prefix] = binding.namespace.value;
    return acc;
  }, {} as Record<string, string>));
};
