import {FileUtils} from "../utils/file-utils";

/**
 * This is a stateful utility class which maintains a registry of filenames mapped to numerical indices.
 */
export class FilePrefixRegistry {
    constructor() {
        this.filesPrefixRegistry = {};
    }

    /**
     * Builds a registry of filenames mapped to numerical indices.
     * The registry is in format <code>{filename: index}</code>.
     * @param {[object]} files - list of files to be used when building the registry.
     */
    buildPrefixesRegistry(files) {
        files.filter((file) => file.type === 'file')
            .forEach((file) => {
                // file name is in format file-name-123.txt
                const fileNameOnly = FileUtils.getFilenameAndExtension(file.name).filename;

                const suffixSeparatorIndex = fileNameOnly.lastIndexOf('-');
                let index = suffixSeparatorIndex < 0 ? 0 : fileNameOnly.substring(suffixSeparatorIndex + 1);
                let filename = fileNameOnly.substring(0, suffixSeparatorIndex);
                if (suffixSeparatorIndex < 0) {
                    index = 0;
                    filename = fileNameOnly;
                } else {
                    index = fileNameOnly.substring(suffixSeparatorIndex + 1);
                    filename = fileNameOnly.substring(0, suffixSeparatorIndex);
                }

                if (index) {
                    index = parseInt(index);
                    const currentIndex = this.filesPrefixRegistry[filename] || 0;
                    this.filesPrefixRegistry[filename] = currentIndex < index ? index : currentIndex;
                } else {
                    this.filesPrefixRegistry[filename] = 0;
                }
            });
    }

    /**
     * Prefixes all the duplicated files with a numeric index.
     * The prefixed file names are in the form of: <originalFileName>-<index>.
     *
     * @param {[object]} files - Array with new files which are selected by the user from the file system.
     * @return {[object]} - The same array with prefixed files.
     */
    prefixDuplicates(files) {
        return files.map((file) => {
            const {filename, extension} = FileUtils.getFilenameAndExtension(file.name);
            const prefixedName = `${filename}-${this.getIndexForFile(filename)}.${extension}`;
            // This is the way how the File name can be changed. It is not possible to change the file name by just
            // calling <code>file.name = 'newName'</code> because the File object is immutable.
            return new File([file], prefixedName, {
                type: file.type,
                lastModified: file.lastModified
            });
        });
    }

    /**
     * Finds the index for the given file name. If the file name is already in the registry, it returns the next index,
     * otherwise it creates a new index for the file name.
     * @param {string} filename - The filename to find the index for.
     * @return {*|number} - The index for the given file name.
     */
    getIndexForFile(filename) {
        let index = this.filesPrefixRegistry[filename];
        if (index !== undefined) {
            index++;
        } else {
            index = 0;
        }
        this.filesPrefixRegistry[filename] = index;
        return index;
    }
}
