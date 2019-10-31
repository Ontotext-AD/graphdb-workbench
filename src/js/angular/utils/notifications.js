angular
    .module('graphdb.framework.utils.notifications', [])
    .factory('Notifications', Notifications);

Notifications.$inject = ['toastr'];

function Notifications(toastr) {
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
            toastr.success(message);
            setTimeout(r, 200);
        });
    }
}
