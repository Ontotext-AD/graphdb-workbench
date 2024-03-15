export class FileUtils {
    /**
     * Convert bytes to megabytes.
     * @param {number} bytes The bytes to convert
     * @return {number} The bytes in megabytes
     */
    static convertBytesToMegabytes(bytes) {
        return Math.floor(bytes / (1024 * 1024));
    }
}
