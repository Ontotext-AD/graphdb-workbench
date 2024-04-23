import {NodeStatusInfo} from "../../models/clustermanagement/node-status-info";

export const nodeStatusInfoMapper = (response) => {
    if (response && response.data) {
        return response.data.map((nodeInfo) => new NodeStatusInfo(nodeInfo.address, nodeInfo.status, nodeInfo.message, nodeInfo.timestamp));
    }
};
