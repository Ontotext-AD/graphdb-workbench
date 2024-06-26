export class HttpUtils {

    /**
     * Extracts the file data and filename from an HTTP response containing a Blob.
     *
     * @param {Object} response - The HTTP response object.
     * @param {string} [filename="download"] - The default filename if none is provided in the response headers.
     * @return {{data: Blob, filename: string}} An object containing the file Blob and its extracted filename.
     */
    static extractFileFromResponse(response, filename = "download") {
        const data = response.data;
        const headers = response.headers();
        const contentDisposition = headers['content-disposition'];
        if (contentDisposition && contentDisposition.includes('filename=')) {
            filename = contentDisposition.split('filename=')[1].replace(/['"]/g, '');
        }
        return {data, filename};
    }
}
