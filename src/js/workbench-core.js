function getError(data, status) {
    if (angular.isObject(data) && data.status && data.data) {
        // called with the result object instead of its data property
        return getError(data.data, status);
    }

    //To use in future - if we add status code
    if (status && status == 403) {
        return 'Access is restricted'
    }
    if (data) {
        var msg = 'Generic error';
        if (angular.isString(data)) {
            // Check if Jetty/Tomcat returned some HTML, if so ignore it
            if (data.indexOf('<html>') === -1) {
                msg = data;
                // Cleanup a stack of Java exception names
                msg = msg.replace(/^(([a-z0-9_]+\.)+[a-zA-Z0-9_]+: )+/, "");
            }
        } else if (angular.isObject(data)) {
            if ('message' in data) {
                msg = data.message;
            }
            if ('error' in data) {
                msg = data.error.message;
            }
            if ('responseText' in data) {
                msg = data.responseText;
            }
        }
        return msg;
    } else {
        return 'There is an error'
    }
}