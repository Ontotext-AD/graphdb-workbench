/**
 * Graph DB connector capabilities
 */
export enum Capability {
  LUCENE_CONNECTOR = 'Lucene connector',
  SOLR_CONNECTOR = 'Solr connector',
  ELASTICSEARCH_CONNECTOR = 'Elasticsearch connector',
  OPENSEARCH_CONNECTOR = 'OpenSearch connector',
  KAFKA_CONNECTOR = 'Kafka connector',
  CLUSTER = 'Cluster',
}
