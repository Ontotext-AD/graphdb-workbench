window.onload = function() {
    //<editor-fold desc="Changeable Configuration Block">

    // the following lines will be replaced by docker/configurator, when it runs in a docker-container
    window.uiRdf4j = SwaggerUIBundle({
        url: "../../rest/api/rdf4j",
        name: "RDF4J API",
        dom_id: '#swagger-ui-container-rdf4j',
        validatorUrl: null,
        deepLinking: true,
        docExpansion: 'none',
        defaultModelRendering: 'example',
        requestInterceptor: function (req) {
            const authToken = window.localStorage.getItem('ontotext.gdb.auth.jwt');
            if (authToken !== null) {
                req.headers['Authorization'] = authToken;
            }
            return req;
        },
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
        plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
    });

    //</editor-fold>

    window.uiWB = SwaggerUIBundle({
        url: "../../rest/api/workbench",
        name: "GraphDB API",
        dom_id: '#swagger-ui-container-graphdb',
        validatorUrl: null,
        deepLinking: true,
        docExpansion: 'none',
        defaultModelRendering: 'example',
        requestInterceptor: function (req) {
            const authToken = window.localStorage.getItem('ontotext.gdb.auth.jwt');
            if (authToken !== null) {
                req.headers['Authorization'] = authToken;
            }
            return req;
        },
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
        plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
    });
};
