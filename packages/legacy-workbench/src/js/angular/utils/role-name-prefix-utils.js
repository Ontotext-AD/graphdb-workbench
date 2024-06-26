export class RoleNamePrefixUtils {
    /**
     * Checks if the given string starts with "CUSTOM_".
     * @param {string} name the string to verify
     * @return {boolean} true, if starts with "CUSTOM_", otherwise false.
     */
    static isCustomPrefixUsed(name) {
        return name.toUpperCase().startsWith("CUSTOM_");
    }
}
