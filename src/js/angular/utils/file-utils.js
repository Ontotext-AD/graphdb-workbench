export class FileUtils {
    /**
     * Parses a file name and returns the filename and the extension.
     * @param {string} fileName The file name to parse
     * @return {{extension: string, filename: string}}
     */
    static getFilenameAndExtension(fileName) {
        const extensionSeparatorIndex = fileName.lastIndexOf('.');
        return {
            filename: fileName.substring(0, extensionSeparatorIndex),
            extension: fileName.substring(extensionSeparatorIndex + 1)
        };
    }

    static downloadAsFile(filename, contentType, content) {
        const element = document.createElement('a');
        element.setAttribute('href', `data:${contentType};charset=utf-8,${encodeURIComponent(content)}`);
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}
