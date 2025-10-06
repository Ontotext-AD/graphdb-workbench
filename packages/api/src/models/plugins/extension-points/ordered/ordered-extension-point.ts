import { ExtensionPoint } from '../extension-point';
import { OrderedPlugin } from '../../plugins/ordered/ordered-plugin';

/**
 * Abstract base class for extension points that specifically hold `OrderedPlugin` instances.
 *
 * Inherits all functionality from `ExtensionPoint<T>` and fixes the generic type to `OrderedPlugin`.
 * This is useful for extension points where plugins have a defined order and priority.
 */
export abstract class OrderedExtensionPoint extends ExtensionPoint<OrderedPlugin> {}
