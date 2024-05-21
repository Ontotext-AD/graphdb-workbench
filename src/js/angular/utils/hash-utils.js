import {KJUR} from "jsrsasign";

export const generateMD5Hash = (str) => {
    const md = new KJUR.crypto.MessageDigest({alg: 'md5', prov: 'cryptojs'});
    return md.digestString(str);
};
