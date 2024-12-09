export type MapperConstructor<T> = new () => Mapper<T>

export abstract class Mapper<T> {

  /**
   * Converts raw data into an instance of the model type `T`.
   *
   * Implementations of this method should define the specific logic for
   * transforming raw input data into the desired model instance.
   *
   * @abstract
   * @param {unknown} data - The raw data to be transformed.
   * @returns {T} - An instance of the model type `T` based on the provided data.
   */
  abstract mapToModel(data: unknown): T;
}
