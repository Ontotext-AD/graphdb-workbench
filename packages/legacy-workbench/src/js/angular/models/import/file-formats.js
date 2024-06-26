export const FILE_FORMATS = ['ttl', 'ttls', 'rdf', 'rj', 'n3', 'nt', 'nq', 'trig', 'trigs', 'trix', 'brf', 'owl', 'jsonld', 'xml', 'rdfs',
    'ndjsonld', 'ndjson', 'jsonl'];

export class FileFormats {
    static getGZS() {
        return FILE_FORMATS.map((format) => `.${format}.gz`);
    }

    static getBasics() {
        return FILE_FORMATS.map((format) => `.${format}`);
    }

    static getFileFormatsExtended() {
        return [...this.getGZS(), ...this.getBasics(), '.zip'].join(', ');
    }

    static getFileFormatsHuman() {
        return [...this.getBasics()].join(' ');
    }

    static getTextFileFormatsHuman() {
        return this.getBasics().filter((el) => el !== '.brf').join(' ');
    }
}
