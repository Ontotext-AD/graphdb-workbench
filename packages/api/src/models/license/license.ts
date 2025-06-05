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
  private _expiryDate?: number;
  private _latestPublicationDate?: number;
  private _licensee?: string;
  private _maxCpuCores?: number;
  private _product?: string;
  private _productType?: string;
  private _licenseCapabilities?: CapabilityList;
  private _version?: string;
  private _installationId?: string;
  private _valid?: boolean;
  private _typeOfUse?: string;
  private _message?: string;
  private _present?: boolean;
  private _usageRestriction?: string;

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
    this.present = data.present || false;
    this.usageRestriction = data.usageRestriction || '';
  }

  get expiryDate(): number | undefined {
    return this._expiryDate;
  }

  set expiryDate(value: number | undefined) {
    this._expiryDate = value;
  }

  get latestPublicationDate(): number | undefined {
    return this._latestPublicationDate;
  }

  set latestPublicationDate(value: number | undefined) {
    this._latestPublicationDate = value;
  }

  get licensee(): string | undefined {
    return this._licensee;
  }

  set licensee(value: string | undefined) {
    this._licensee = value;
  }

  get maxCpuCores(): number | undefined {
    return this._maxCpuCores;
  }

  set maxCpuCores(value: number | undefined) {
    this._maxCpuCores = value;
  }

  get product(): string | undefined {
    return this._product;
  }

  set product(value: string | undefined) {
    this._product = value;
  }

  get productType(): string | undefined {
    return this._productType;
  }

  set productType(value: string | undefined) {
    this._productType = value;
  }

  get licenseCapabilities(): CapabilityList | undefined {
    return this._licenseCapabilities;
  }

  set licenseCapabilities(value: CapabilityList | undefined) {
    this._licenseCapabilities = value;
  }

  get version(): string | undefined {
    return this._version;
  }

  set version(value: string | undefined) {
    this._version = value;
  }

  get installationId(): string | undefined {
    return this._installationId;
  }

  set installationId(value: string | undefined) {
    this._installationId = value;
  }

  get valid(): boolean | undefined {
    return this._valid;
  }

  set valid(value: boolean | undefined) {
    this._valid = value;
  }

  get typeOfUse(): string | undefined {
    return this._typeOfUse;
  }

  set typeOfUse(value: string | undefined) {
    this._typeOfUse = value;
  }

  get message(): string | undefined {
    return this._message;
  }

  set message(value: string | undefined) {
    this._message = value;
  }

  get present(): boolean | undefined {
    return this._present;
  }

  set present(value: boolean | undefined) {
    this._present = value;
  }

  get usageRestriction(): string | undefined {
    return this._usageRestriction;
  }

  set usageRestriction(value: string | undefined) {
    this._usageRestriction = value;
  }
}
