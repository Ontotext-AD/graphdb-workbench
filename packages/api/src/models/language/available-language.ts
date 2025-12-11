import { Model } from '../common';

/**
 * Represents an available language in the system.
 */
export class AvailableLanguage extends Model<AvailableLanguage> {
  constructor(
    readonly key: string,
    readonly name: string
  ) {
    super();
  }
}
