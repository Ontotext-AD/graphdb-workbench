import {SecurityConfig} from '../../../models/security/security-config';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper class for converting partial SecurityConfig objects to complete SecurityConfig models.
 */
export const mapSecurityConfigResponseToModel: MapperFn<Partial<SecurityConfig>, SecurityConfig> = (data) => {
  return new SecurityConfig(data);
};
