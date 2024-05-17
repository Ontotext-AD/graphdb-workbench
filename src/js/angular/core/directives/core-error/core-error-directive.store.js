import {ComponentStoreService} from "../../services/component-store.service";
import {EventEmitterService} from "../../services/event-emitter.service";

export const CoreErrorPropertyName = {
    PAGE_RESTRICTED: 'PAGE_RESTRICTED'
};

angular
    .module('graphdb.framework.stores.core-error.store', [])
    .factory('CoreErrorDirectiveStore', CoreErrorDirectiveStore);

CoreErrorDirectiveStore.$inject = [];

function CoreErrorDirectiveStore() {

    const context = new ComponentStoreService(new EventEmitterService());

    const getPageRestricted = () => {
        return context.get(CoreErrorPropertyName.PAGE_RESTRICTED);
    };

    /**
     * @param {boolean} pageRestricted
     */
    const updatePageRestricted = (pageRestricted) => {
        context.update(CoreErrorPropertyName.PAGE_RESTRICTED, pageRestricted);
    };

    const onPageRestrictedUpdated = (callback) => {
        return context.onUpdated(CoreErrorPropertyName.PAGE_RESTRICTED, callback);
    };

    return {
        getPageRestricted,
        updatePageRestricted,
        onPageRestrictedUpdated
    };
}
