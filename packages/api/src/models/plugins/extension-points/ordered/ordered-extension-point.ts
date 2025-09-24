import { ExtensionPoint } from '../extension-point';
import { OrderedPlugin } from '../../plugins/ordered/ordered-plugin';

/**
 * Abstract base class for extension points that have a defined order and priority.
 */
export abstract class OrderedExtensionPoint extends ExtensionPoint<OrderedPlugin> {}
