export class FileUtils {
    /**
     * Convert bytes to megabytes.
     * @param {number} bytes The bytes to convert
     * @return {number} The bytes in megabytes
     */
    static convertBytesToMegabytes(bytes) {
        return Math.floor(bytes / (1024 * 1024));
    }

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
}
