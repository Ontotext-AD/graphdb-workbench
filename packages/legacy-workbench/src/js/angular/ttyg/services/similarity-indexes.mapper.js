import {SimilarityInstanceType} from '../../models/similarity/similarity-instance-type';

/**
 * Maps backend response like
 * { "elasticsearch:otkg-vector": ["a"], "similarity": ["x"] }
 * into
 * { elasticsearch: { "otkg-vector": ["a"] }, similarity: "x": [] }
 *
 * Example:
 * <pre>
 * const resp = {
 *   "elasticsearch:otkg-vector": ["docText1", "docText2"],
 *   "elasticsearch:otkg-vector-new": ["docText1"],
 *   "similarity": ["test", "test1"]
 * };
 *
 * mapConnectorResponse(resp);
 * {
 *   elasticsearch: {
 *     "otkg-vector": ["docText1","docText2"],
 *     "otkg-vector-new": ["docText1"]
 *   },
 *   similarity: ["test","test1"],
 * }
 * </pre>
 */
export const similarityIndexesMapper = (resp) => {
    if (!resp) {
        return {};
    }

    const connectorMap = {};

    Object.entries(resp).forEach(([key, value]) => {
        const firstColonIndex = key.indexOf(':');

        if (firstColonIndex === -1) {
            const connector = key;
            if (!connectorMap[connector]) {
                connectorMap[connector] = {};
            }

            if (connector === SimilarityInstanceType.SIMILARITY) {
                const items = Array.isArray(value) ? value : [];
                items
                    .filter(Boolean)
                    .forEach((name) => {
                        connectorMap[connector][name] = [];
                    });
            } else {
                // Fallback for other no-colon connectors
                connectorMap[connector][connector] = Array.isArray(value) ? value : [];
            }
            return;
        }

        const [connector, type] = key.split(':');

        if (!connectorMap[connector]) {
            connectorMap[connector] = {};
        }

        connectorMap[connector][type] = Array.isArray(value) ? value : [];
    });

    return connectorMap;
};

