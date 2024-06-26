window.onload = function() {
    window.uiRdf4j = SwaggerUIBundle({
        url: "../../rest/api/rdf4j",
        name: "RDF4J API",
        dom_id: '#swagger-ui-container-rdf4j',
        validatorUrl: null,
        deepLinking: true,
        docExpansion: 'none',
        defaultModelRendering: 'example',
        requestInterceptor: function (req) {
            const authToken = window.localStorage.getItem('com.ontotext.graphdb.auth');
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

    window.uiWB = SwaggerUIBundle({
        url: "../../rest/api/workbench",
        name: "GraphDB API",
        dom_id: '#swagger-ui-container-graphdb',
        validatorUrl: null,
        deepLinking: true,
        docExpansion: 'none',
        defaultModelRendering: 'example',
        requestInterceptor: function (req) {
            const authToken = window.localStorage.getItem('com.ontotext.graphdb.auth');
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
