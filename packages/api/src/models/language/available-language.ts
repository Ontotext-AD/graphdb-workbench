import { Model } from '../common';
import {AvailableLanguageDto} from '../../services/language/mappers/language-config-mapper';

/**
 * Represents an available language in the system.
 */
export class AvailableLanguage extends Model<AvailableLanguage> {
  key: string;
  name: string;

  constructor(data: AvailableLanguageDto) {
    super();
    this.key = data.key;
    this.name = data.name;
  }
}
