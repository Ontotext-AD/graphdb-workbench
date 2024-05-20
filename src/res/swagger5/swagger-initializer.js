window.onload = function () {

    function extendExecuteFunction() {
        return {
            statePlugins: {
                spec: {
                    wrapActions: {
                        executeRequest: (originalAction, system) => (req) => {
                            originalAction(req).then(response => {
                                const executionOff = true;
                                if (executionOff) {
                                    let path = req.pathName;
                                    let method = req.method;
                                    // system.specActions.clearRequest(path, method);
                                    // system.specActions.clearResponse(path, method);
                                    // system.specActions.updateLoadingStatus(null);
                                }
                                return response;
                            }).catch(error => {
                                console.error("Error in executeRequest", error);
                                throw error;
                            });
                        },
                        setRequest: (originalAction, system) => (path, method, request) => {
                            console.log("Generated cURL Command:", system.fn.requestSnippetGenerator_curl_bash(system.Im.fromJS(request)));
                            // calculate it dynamically
                            const executionOff = true;
                            if (executionOff) {
                                let parsedMutatedRequest = Object.assign({}, request)
                                system.specActions.setMutatedRequest(path, method, parsedMutatedRequest);
                            }
                            // Call the original action
                            return originalAction(path, method, request);
                        }
                    }
                }
            },
            afterLoad(system) {
                let originExecute = system.fn['execute'];
                system.fn['execute'] = (req) => {
                    // calculate it dynamically
                    const executionOff = true;
                    if (executionOff) {
                        return Promise.reject({});
                    }
                    return originExecute(req);
                }
            }
        };
    }

    function extendTryItOutButton(system) {
        return {
            // Specify the name of the plugin
            name: 'extend-try-it-out-button-plugin',

            // Hook into the Swagger UI initialization process
            wrapComponents: {
                // Add custom logic to the TryItOutButton component
                TryItOutButton: (Original, system) => {
                    return class extends Original {
                        render() {

                            // Call the original render method to get the original renderer
                            const originalRenderer = Original.prototype.render.call(this);
                            // Define a function to generate cURL command
                            const generateCurl = () => {

                                console.log('################# Before render ########################3');
                                console.log('Props: ', this.props);
                                console.log('Spec: ', system.spec);

                                let state = system.getState();
                                console.log(state);

                                let spec = state.get('spec');
                                console.log(spec);


                                const req = {
                                    url: "http://example.com",
                                    method: "POST",
                                    body: JSON.stringify({
                                        id: 0,
                                        name: "doggie",
                                        status: "available"
                                    }, null, 2),
                                    headers: {
                                        Accept: "application/json",
                                        "content-type": "application/json"
                                    }
                                };

                                let curlCommand = system.fn.requestSnippetGenerator_curl_bash(system.Im.fromJS(req));
                                // Display the cURL command
                                console.log('Generated cURL Command:', curlCommand);
                            };

                            // Create your custom button element for generating cURL command
                            const CurlButton = system.React.createElement('button', {
                                onClick: generateCurl,
                                style: {marginLeft: '8px'} // Add margin to the left for space
                            }, 'Generate cURL');

                            // Return the original rendering and the custom buttons wrapped in a container with flexbox layout
                            return system.React.createElement('div', {style: {display: 'flex'}}, originalRenderer, CurlButton);
                        }
                    };
                }
            }
        };
    }

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
            SwaggerUIBundle.plugins.DownloadUrl,
            extendExecuteFunction
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
            SwaggerUIBundle.plugins.DownloadUrl,
            extendExecuteFunction
        ],
        layout: "StandaloneLayout"
    });

};
