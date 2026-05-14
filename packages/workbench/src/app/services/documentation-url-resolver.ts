import {Injectable} from '@angular/core';
import {BuildUtil} from '@ontotext/workbench-api';

@Injectable({
  providedIn: 'root'
})
export class DocumentationUrlResolver {
  private static readonly BASE_DOCUMENTATION_URL = 'https://graphdb.ontotext.com/documentation/';
  private static readonly LATEST_UNOFFICIAL_VERSION = 'master';

  static getDocumentationUrl(productVersion: string, endpointPath: string) {
    if (!endpointPath) {
      return;
    }

    const isUnofficialVersion = productVersion.includes('-');
    const isDevMode = BuildUtil.isDevMode();
    const version = (isDevMode || isUnofficialVersion) ? DocumentationUrlResolver.LATEST_UNOFFICIAL_VERSION : productVersion;
    return `${DocumentationUrlResolver.BASE_DOCUMENTATION_URL}${version}/${endpointPath}`;
  }
}
