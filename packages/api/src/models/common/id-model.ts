import { Model } from './model';
import {GeneratorUtils} from '../../services/utils/generator-utils';

/**
 * Represents a generic model that includes a unique identifier (`id`).
 *
 * This class extends the base {@link Model} class and automatically assigns a UUID to each instance using.
 *
 * @template T - The type of data managed by the model.
 * @extends Model<T>
 */
export class IdModel<T> extends Model<T> {
  /**
   * The unique identifier for this model instance.
   */
  readonly id: string;

  /**
   * Creates a new {@link IdModel} instance with a unique identifier.
   */
  constructor() {
    super();
    this.id = GeneratorUtils.uuid();
  }
}
