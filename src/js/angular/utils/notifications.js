angular
    .module('graphdb.framework.utils.notifications', [])
    .factory('Notifications', Notifications);

Notifications.$inject = ['toastr', '$translate'];

function Notifications(toastr, $translate) {
    return {
        showToastMessageWithDelay
    };

    /**
     *  This method will show message with tiny delay and only after completion
     *  of latter redirection to "graphs-visualizations" page will happen.
     * @param {string} message The message to be displayed.
     * @return {Promise<any>}
     */
    function showToastMessageWithDelay(message) {
        return new Promise((r) => {
            toastr.success($translate.instant(message));
            setTimeout(r, 200);
        });
    }
}
