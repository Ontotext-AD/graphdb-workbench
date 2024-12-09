import {Mapper, MapperConstructor} from './mapper';

/**
 * A utility class that provides and manages singleton instances of `Mapper` objects.
 *
 * The `MapperProvider` is designed to handle the creation and reuse of `Mapper` instances
 * for different types. Each type of `Mapper` is stored in a map, ensuring that only one instance
 * per type exists during the application's lifecycle.
 */
export class MapperProvider {
  /**
   * A static map that stores singleton instances of `Mapper` objects, keyed by their type name.
   */
  private static readonly MAPPER_INSTANCES: Map<string, Mapper<unknown>> = new Map<string, Mapper<unknown>>();

  /**
   * Retrieves a Mapper instance for the given type. If no instance exists, a new one is created,
   * stored, and then returned.
   *
   * @template T - The specific Mapper type to retrieve or create.
   * @param type - The constructor of the Mapper to retrieve or create.
   * @returns The Mapper instance for the given type.
   */
  public static get<T>(type: MapperConstructor<T>): Mapper<T> {
    const typeName = type.name;

    // Check if an instance exists
    if (!MapperProvider.MAPPER_INSTANCES.has(typeName)) {
      // Create a new instance and store it
      const instance = new type();
      MapperProvider.MAPPER_INSTANCES.set(typeName, instance);
    }

    // Return the existing or newly created instance
    return MapperProvider.MAPPER_INSTANCES.get(typeName) as Mapper<T>;
  }
}
