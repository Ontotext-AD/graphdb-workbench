import { Model } from '../common';

/**
 * Represents an available language in the system.
 */
export class AvailableLanguage extends Model<AvailableLanguage> {
  key: string;
  name: string;

  constructor(data: AvailableLanguage) {
    super();
    this.key = data.key;
    this.name = data.name;
  }
}
