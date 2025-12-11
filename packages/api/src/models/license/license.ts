import {Model} from '../common/model';
import {CapabilityList} from './capability-list';
import {Product} from './product';
import {ProductType} from './product-type';

/**
 * Represents a Graph DB license.
 *
 * Inherits copy functionality from {@link Model} and contains various properties of a GraphDB license.
 */
export class License extends Model<License> {
  readonly expiryDate?: Date;
  readonly latestPublicationDate?: Date;
  readonly licensee?: string;
  readonly maxCpuCores?: number;
  readonly product?: Product;
  readonly licenseCapabilities?: CapabilityList;
  readonly version?: string;
  readonly installationId?: string;
  readonly valid?: boolean;
  readonly message?: string;
  readonly present?: boolean;
  readonly usageRestriction?: string;

  productType?: ProductType;
  typeOfUse?: string;

  /**
   * Creates a new License instance.
   *
   * @param data - Partial data to initialize the License object. This can include any of the properties
   * defined in the License class. Default values are applied for some properties if not provided.
   */
  constructor(data?: Partial<License>) {
    super();
    this.expiryDate = data?.expiryDate;
    this.latestPublicationDate = data?.latestPublicationDate;
    this.licensee = data?.licensee || '';
    this.maxCpuCores = data?.maxCpuCores;
    this.product = data?.product;
    this.productType = data?.productType;
    this.licenseCapabilities = data?.licenseCapabilities;
    this.version = data?.version || '';
    this.installationId = data?.installationId || '';
    this.valid = data?.valid;
    this.typeOfUse = data?.typeOfUse || '';
    this.message = data?.message || '';
    this.present = data?.present || false;
    this.usageRestriction = data?.usageRestriction || '';
  }
}
