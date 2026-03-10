import {NamespaceMap} from '../../../../models/namespace';
import {MapperFn} from '../../../../providers/mapper/mapper-fn';
import {NamespacesResponse} from '../../rdf4j';

/**
 * Mapper class for converting namespace API responses to a model list of namespaces.
 */
export const mapNamespaceResponseToModel: MapperFn<NamespacesResponse, NamespaceMap> = (data) => {
  const namespaces = data?.results.bindings || [];
  const namespaceMap = namespaces.reduce((acc, binding) => {
    const prefix = binding.prefix.value;
    acc[prefix] = binding.namespace.value;
    return acc;
  }, {} as Record<string, string>);
  return new NamespaceMap(namespaceMap);
};
