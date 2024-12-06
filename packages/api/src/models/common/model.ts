import { Copyable } from './copyable';
import { ObjectUtil } from '../../services/utils';

/**
 * Base class for all models, providing deep copy functionality.
 *
 * This abstract class ensures that any model extending it implements immutability
 * by providing a `copy` method, which creates a deep copy of the current instance.
 *
 * All models in the application are expected to extend this class to inherit the
 * `copy` behavior, ensuring consistency in how objects are cloned and manipulated.
 *
 * @template <T> The type of the model extending this class.
 */
export abstract class Model<T> implements Copyable<T> {

  /**
   * Creates a deep copy of the current instance.
   *
   * This method utilizes `ObjectUtil.deepCopy` to create a new instance of the model
   * with all properties and nested objects deeply cloned, ensuring that any changes
   * to the copy do not affect the original instance.
   *
   * @returns A new instance of the type `T` that is a deep copy of the original.
   */
  copy(): T {
    return ObjectUtil.deepCopy(this) as unknown as T;
  }
}
