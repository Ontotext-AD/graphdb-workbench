export class HtmlUtil {

    /**
     * Extracts and returns the plain text content from a given HTML string by removing any HTML tags.
     *
     * @param {string} html - The HTML string from which to extract plain text.
     *
     * @example
     * const plainText = HtmlUtil.getText('<div>Hello <strong>World</strong></div>');
     * console.log(plainText); // Outputs: "Hello World"
     */
    static getText(html) {
        if (!html) {
            return html;
        }
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.innerText;
    }
}
