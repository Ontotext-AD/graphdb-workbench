import { Model } from '../common/model';
import { CapabilityList } from './capability-list';
import { CapabilityListMapper } from '../../services/license/mappers/capability-list.mapper';
import { MapperProvider } from '../../providers';

/**
 * Represents a Graph DB license.
 *
 * Inherits copy functionality from {@link Model} and contains various properties of a GraphDB license.
 */
export class License extends Model<License> {
  // Epoch
  expiryDate?: number;
  // Epoch
  latestPublicationDate?: number;
  licensee?: string;
  maxCpuCores?: number;
  product?: string;
  productType?: string;
  licenseCapabilities?: CapabilityList;
  version?: string;
  installationId?: string;
  valid?: boolean;
  typeOfUse?: string;
  message?: string;

  /**
   * Creates a new License instance.
   *
   * @param data - Partial data to initialize the License object. This can include any of the properties
   * defined in the License class. Default values are applied for some properties if not provided.
   */
  constructor(data: Partial<License>) {
    super();
    this.expiryDate = data.expiryDate;
    this.latestPublicationDate = data.latestPublicationDate;
    this.licensee = data.licensee || '';
    this.maxCpuCores = data.maxCpuCores;
    this.product = data.product || '';
    this.productType = data.productType || '';
    this.licenseCapabilities = MapperProvider.get(CapabilityListMapper).mapToModel(data.licenseCapabilities);
    this.version = data.version || '';
    this.installationId = data.installationId || '';
    this.valid = data.valid;
    this.typeOfUse = data.typeOfUse || '';
    this.message = data.message || '';
  }
}
