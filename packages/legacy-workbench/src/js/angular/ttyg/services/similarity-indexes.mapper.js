/**
 * Maps backend response into:
 * { [connectorType: string]: { [similarityIndex: string]: string[] } }
 *
 * Example:
 * const resp = {
 *   elasticsearch: [
 *     { similarityIndex: "acme_index", connectorFields: ["text", "text3"] },
 *     { similarityIndex: "acme_index1", connectorFields: ["text", "text3"] }
 *   ],
 *   similarity: [
 *     { similarityIndex: "test_index" },
 *     { similarityIndex: "newTest" }
 *   ]
 * };
 *
 * similarityIndexesMapper(resp);
 * =>
 * {
 *   elasticsearch: {
 *     acme_index: ["text", "text3"],
 *     acme_index1: ["text", "text3"]
 *   },
 *   similarity: {
 *     test_index: [],
 *     newTest: []
 *   }
 * }
 */
export const similarityIndexesMapper = (resp) => {
    if (!resp || typeof resp !== 'object') {
        return {};
    }

    const connectorMap = {};
    Object.entries(resp).forEach(([connectorType, items]) => {
        if (!Array.isArray(items)) {
            return;
        }

        if (!connectorMap[connectorType]) {
            connectorMap[connectorType] = {};
        }

        items.forEach((item) => {
            if (!item || !item.similarityIndex) {
                return;
            }

            const name = item.similarityIndex;
            const fields = Array.isArray(item.connectorFields)
                ? item.connectorFields.filter(Boolean)
                : [];

            connectorMap[connectorType][name] = fields;
        });
    });

    return connectorMap;
};


