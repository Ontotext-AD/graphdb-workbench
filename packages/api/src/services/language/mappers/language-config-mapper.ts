import {LanguageConfig} from '../../../models/language';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper class for LanguageConfig objects.
 */
export const mapLanguageConfigResponseToModel: MapperFn<LanguageConfig, LanguageConfig> = (data) => {
  return new LanguageConfig(data);
};
