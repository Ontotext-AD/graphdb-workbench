const BASE_DOCUMENTATION_URL = 'https://graphdb.ontotext.com/documentation/';
const LATEST_UNOFFICIAL_VERSION = 'master';

export class DocumentationUrlResolver {
    static getDocumentationUrl(productVersion, endpointPath) {
        if (!endpointPath) {
            return;
        }

        const isUnofficialVersion = productVersion.includes('-');
        const version = (window.wbDevMode || isUnofficialVersion) ? LATEST_UNOFFICIAL_VERSION : productVersion;
        return `${BASE_DOCUMENTATION_URL}${version}/${endpointPath}`;
    }
}
