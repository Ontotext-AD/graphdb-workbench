window.onload = function() {
    //<editor-fold desc="Changeable Configuration Block">

    const params = new URLSearchParams(window.location.search);
    const basePath = params.get('basePath') || '';

    const requestInterceptor = (req) => {
        const authToken = window.localStorage.getItem('ontotext.gdb.auth.jwt');
        if (authToken !== null) {
            req.headers['Authorization'] = authToken;
        }
        if (basePath && !req.url.includes(basePath)) {
            const url = new URL(req.url);
            url.pathname = basePath + url.pathname;
            req.url = url.toString();
        }
        return req;
    };

    // the following lines will be replaced by docker/configurator, when it runs in a docker-container
    // eslint-disable-next-line new-cap
    window.uiRdf4j = SwaggerUIBundle({
        url: `${basePath}/rest/api/rdf4j`,
        name: "RDF4J API",
        dom_id: '#swagger-ui-container-rdf4j',
        validatorUrl: null,
        deepLinking: true,
        docExpansion: 'none',
        defaultModelRendering: 'example',
        requestInterceptor: requestInterceptor,
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset,
        ],
        plugins: [
            SwaggerUIBundle.plugins.DownloadUrl,
        ],
        layout: "StandaloneLayout",
    });

    //</editor-fold>
    // eslint-disable-next-line new-cap
    window.uiWB = SwaggerUIBundle({
        url: `${basePath}/rest/api/workbench`,
        name: "GraphDB API",
        dom_id: '#swagger-ui-container-graphdb',
        validatorUrl: null,
        deepLinking: true,
        docExpansion: 'none',
        defaultModelRendering: 'example',
        requestInterceptor: requestInterceptor,
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset,
        ],
        plugins: [
            SwaggerUIBundle.plugins.DownloadUrl,
        ],
        layout: "StandaloneLayout",
    });
};
