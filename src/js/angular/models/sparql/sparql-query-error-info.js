/**
 * Holds information about a sparql query error.
 */
export const MAX_VISIBLE_ERROR_CHARACTERS = 160;

export class SparqlQueryErrorInfo {
    constructor(status = '', statusText = '', responseText = '') {
        if (responseText && responseText.length > MAX_VISIBLE_ERROR_CHARACTERS) {
            this.shortenErrorMessage = responseText.substring(0, MAX_VISIBLE_ERROR_CHARACTERS);
        }
        this.status = status;
        this.statusText = statusText;
        this.responseText = responseText;
    }
}
