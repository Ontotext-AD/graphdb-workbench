/**
 * Represents the supported external location types.
 */
export enum LocationType {
  /**
   * A remote GraphDB instance location, that can host and manage repositories.
   */
  GDB = 'GDB',

  /**
   * An Ontopic SPARQL endpoint location.
   */
  ONTOPIC = 'ONTOPIC',

  /**
   * A generic SPARQL endpoint location.
   */
  SPARQL = 'SPARQL'
}
