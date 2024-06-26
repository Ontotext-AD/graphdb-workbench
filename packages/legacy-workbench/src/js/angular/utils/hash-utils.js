import {KJUR} from "jsrsasign";

/**
 * Returns a function that generates a MD5 hash for a given string.
 * @return {function(*): *}
 */
export const md5HashGenerator = () => {
    const md = new KJUR.crypto.MessageDigest({alg: 'md5', prov: 'cryptojs'});

    /**
     * Generates a MD5 hash for a given string.
     * @param {string} str the string to hash.
     * @return {string} the MD5 hash.
     */
    return (str) => md.digestString(str);
};
