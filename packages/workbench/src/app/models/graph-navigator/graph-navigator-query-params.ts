/**
 * Query parameter names used when opening the Graph Navigator via a direct link.
 */
export const GraphNavigatorQueryParams = {
  // Query parameter holding the IRI of the start resource, which is placed on the canvas as a seed.
  URI: 'uri',
  // Query parameter holding the SPARQL query, whose graph is placed on the canvas as a seed.
  QUERY: 'query',
  // Query parameter flag used to determine if the query should be evaluated with inference.
  INFERENCE: 'inference',
  // Query parameter flag used to determine if the query should be evaluated with `owl:sameAs` expansion.
  SAME_AS: 'sameAs',
} as const;
