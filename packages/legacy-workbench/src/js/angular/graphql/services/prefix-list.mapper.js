import {Prefix, PrefixList} from "../../models/prefix/prefixes";
import {SelectMenuOptionsModel} from "../../models/form-fields";

/**
 * Maps the prefix list response data to a prefix list model.
 * @param {*} data The prefix list response data.
 * @returns {PrefixList}
 */
export const prefixListMapper = (data) => {
    if (!data && !data.prefixes) {
        return new PrefixList();
    }
    const prefixes = data.prefixes.map((endpoint) => prefixModelMapper(endpoint));
    return new PrefixList(prefixes);
}

const prefixModelMapper = (data) => {
    if (!data) {
        return;
    }
    return new Prefix({
        prefix: data.prefix,
        namespace: data.namespace,
        sources: data.sources
    });
}

/**
 * Maps the prefix list to a list of select menu options.
 * @param {*} data The prefix list response data.
 * @returns {SelectMenuOptionsModel[]} The list of select menu options.
 */
export const prefixModelToSelectMenuOptionsMapper = (data) => {
    if (!data || !data.prefixes) {
        return [];
    }
    return data.prefixes.map((prefix) => {
        return new SelectMenuOptionsModel({
            value: prefix.prefix,
            label: prefix.prefix,
            selected: false
        });
    });
}
