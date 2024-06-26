import {NodeState} from "./node-state";
import {LinkState} from "./states";

const CLUSTER_MANAGEMENT_CONSTANTS = (function () {
    const SVG_NODE_WIDTH = 15;

    const PADDING_LEFT = 12;
    const PADDING_TOP = 12;

    const TITLE_PADDING_TOP = 15;
    const TITLE_FONT_SIZE = 13;
    const TITLE_FONT_WEIGHT = 700;
    const TITLE_LINE_HEIGHT = 18;
    const TITLE_COLOR = '#000000';

    const LEGEND_ITEMS_PADDING_TOP = 40;
    const LEGEND_ITEM_PADDING_TOP = 8;
    const LEGEND_ITEM_ICON_FONT_SIZE = 15;
    const LEGEND_ITEM_FONT_SIZE = 11;
    const LEGEND_ITEM_FONT_WEIGHT = 400;
    const LEGEND_ITEM_COLOR = '#000000';
    const LEGEND_ITEM_LINE_HEIGHT = 13;
    const LEGEND_ITEM_PADDING_LEFT = PADDING_LEFT + SVG_NODE_WIDTH;

    const BACKGROUND_PADDING = PADDING_LEFT * 2;

    const getLegendNodes = function () {
        const legendNodes = [];
        legendNodes.push({nodeState: NodeState.LEADER, customText: 'node_state_leader'});
        legendNodes.push({nodeState: NodeState.FOLLOWER, customText: 'node_state_follower'});
        // the out of sync node in the leged should not have an icon
        legendNodes.push({nodeState: NodeState.OUT_OF_SYNC_BLANK, customText: 'node_state_out_of_sync'});
        legendNodes.forEach((node, index) => node.id = index);
        return legendNodes;
    };

    const getLegendLinks = function () {
        const links = [];
        links.push({status: LinkState.IN_SYNC, linkTypeKey: 'link_state_in_sync'});
        links.push({status: LinkState.SYNCING, linkTypeKey: 'link_state_syncing'});
        links.push({status: LinkState.OUT_OF_SYNC, linkTypeKey: 'link_state_out_of_sync'});
        links.push({status: LinkState.RECEIVING_SNAPSHOT, linkTypeKey: 'link_state_receiving_snapshot'});
        links.forEach((link, index) => link.id = index);
        return links;
    };

    const getSyncStatuses = () => {
        return [
            {
                labelKey: 'node_state_candidate',
                classes: 'icon-any',
                icon: '\ue914'
            }, {
                labelKey: 'node_state_no_cluster',
                classes: 'close',
                icon: 'X'
            }, {
                labelKey: 'link_state_out_of_sync',
                classes: 'icon-any',
                icon: '\ue920'
            }, {
                labelKey: 'node_state_no_connection',
                classes: 'icon-any',
                icon: '\ue931'
            }, {
                labelKey: 'node_state_read_only',
                classes: 'icon-any',
                icon: '\ue95c'
            }, {
                labelKey: 'node_state_restricted',
                classes: 'icon-any',
                icon: '\ue933'
            }, {
                labelKey: 'recovery_state.searching_for_node',
                classes: 'fa-d3',
                icon: '\uf29c'
            }, {
                labelKey: 'recovery_state.waiting_for_snapshot',
                classes: 'fa-d3',
                icon: '\uf017'
            }, {
                labelKey: 'recovery_state.building_snapshot',
                classes: 'fa-d3',
                icon: '\uf187'
            }, {
                labelKey: 'recovery_state.sending_snapshot',
                classes: 'fa-d3',
                icon: '\uf0ee'
            }, {
                labelKey: 'recovery_state.receiving_snapshot',
                classes: 'fa-d3',
                icon: '\uf0ed'
            }, {
                labelKey: 'recovery_state.applying_snapshot',
                classes: 'fa-d3',
                icon: '\uf050'
            }
        ];
    };

    return {
        getLegendNodes,
        getSyncStatuses,
        getLegendLinks,
        SVG_NODE_WIDTH,
        PADDING_LEFT,
        PADDING_TOP,
        TITLE_PADDING_TOP,
        TITLE_FONT_SIZE,
        TITLE_FONT_WEIGHT,
        TITLE_COLOR,
        TITLE_LINE_HEIGHT,
        LEGEND_ITEM_FONT_SIZE,
        LEGEND_ITEM_ICON_FONT_SIZE,
        LEGEND_ITEM_FONT_WEIGHT,
        LEGEND_ITEM_COLOR,
        LEGEND_ITEM_LINE_HEIGHT,
        LEGEND_ITEM_PADDING_LEFT,
        LEGEND_ITEMS_PADDING_TOP,
        LEGEND_ITEM_PADDING_TOP,
        BACKGROUND_PADDING
    };
})();

export {
    CLUSTER_MANAGEMENT_CONSTANTS
};
