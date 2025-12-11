import {HttpService} from '../http/http.service';
import {LicenseResponse} from './response/license-response';

/**
 * Service class for handling REST API calls related to license operations.
 * Extends the HttpService to utilize its HTTP request capabilities.
 */
export class LicenseRestService extends HttpService {
  private readonly LICENSE_ENDPOINT = 'rest/graphdb-settings/license';
  private readonly LICENSE_INFO_ENDPOINT = 'rest/info/license';

  /**
   * Retrieves the current license information from the GraphDB settings.
   *
   * This method sends a GET request to the '/rest/graphdb-settings/license' endpoint
   * to fetch the license details.
   *
   * @returns A Promise that resolves to a License object containing the current license information.
   */
  getLicense(): Promise<LicenseResponse> {
    return this.get(this.LICENSE_ENDPOINT);
  }

  /**
   * Checks if the license is hardcoded in the system.
   *
   * This method sends a GET request to the '/rest/graphdb-settings/license/hardcoded' endpoint
   * to determine if the license is hardcoded.
   *
   * @returns A Promise that resolves to a string indicating whether the license is hardcoded.
   */
  getIsLicenseHardcoded(): Promise<boolean> {
    return this.get(`${this.LICENSE_ENDPOINT}/hardcoded`);
  }

  /**
   * Registers a new license using the provided license code.
   *
   * This method sends a POST request to the '/rest/graphdb-settings/license' endpoint
   * with the provided license code in the request body.
   *
   * @param licenseCode - The license code as a base64 encoded string to be registered.
   * @returns A Promise that resolves to a LicenseResponse object containing the registered license information.
   */
  registerLicense(licenseCode: string): Promise<LicenseResponse> {
    const array = new Uint8Array(licenseCode.length);
    for (let i = 0; i < array.length; i++) {
      array[i] = licenseCode.charCodeAt(i);
    }

    const headers = {
      'Content-Type': 'application/octet-stream'
    };

    return this.post(this.LICENSE_ENDPOINT, {body: array, headers});
  }

  /**
   * Unregisters the current license from the system.
   *
   * This method sends a DELETE request to the '/rest/graphdb-settings/license' endpoint
   * to remove the existing license.
   *
   * @returns A Promise that resolves when the license has been successfully unregistered.
   */
  unregisterLicense(): Promise<void> {
    return this.delete(this.LICENSE_ENDPOINT);
  }

  /**
   * Extracts license information from a given license file.
   *
   * This method uploads the provided license file to the '/rest/info/license/to-base-64' endpoint
   * and retrieves the extracted license information in base64 format.
   *
   * @param file - The license file to be uploaded and processed.
   * @returns A Promise that resolves to a string containing the extracted license information in base64 format.
   */
  extractFromLicenseFile(file: File): Promise<string> {
    return this.uploadFile(`${this.LICENSE_INFO_ENDPOINT}/to-base-64`, file, undefined, {'Accept': 'text/plain'})
      .then((response) => response.data as string);
  }

  // send license to be validated and parsed before activation
  /**
   * Validates a given license code.
   *
   * This method sends a POST request to the '/rest/info/license/validate' endpoint
   * with the provided license code in the request body for validation.
   *
   * @param licenseCode - The license code as base64 encoded string to be validated.
   * @returns A Promise that resolves to a LicenseResponse object containing the validation result.
   */
  validateLicense(licenseCode: string): Promise<LicenseResponse> {
    const headers = {
      'Content-Type': 'text/plain'
    };
    return this.post(`${this.LICENSE_INFO_ENDPOINT}/validate`, {body: licenseCode, headers});
  }
}
