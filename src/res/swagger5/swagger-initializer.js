window.onload = function () {
    // Placed in WB config
    const WBApiButton = function () {
        return {
            wrapComponents: { //Wrap Components allow you to override a component registered within the system
                execute: (Original, system) => () => {
                    // Generates a button on every 'Try it out' click, but it replaces the 'Execute' button completely
                    console.log(Original); // Original component
                    const button = document.createElement('button');
                    button.textContent = 'Generate cURL';
                    button.className = 'btn';
                    button.style.margin = '2.5px';
                    button.addEventListener('click', () => console.log(system));
                    console.log('wrapComponents execute');
                    const parentElement = document.querySelectorAll('.swagger-ui .try-out');
                    console.log(parentElement);
                    parentElement.forEach((element) => element.appendChild(button));
                }
            },
            afterLoad(system) {
                // When Swagger has loaded, the panels are collapsed, so using querySelector to get any elements inside
                // to add a button doesn't seem to work
                console.log('afterLoad WB');
                console.log(system.fn.requestSnippetGenerator_curl(JSON.stringify({
                    url: 'http://localhost:9000/repositories/news/size',
                    method: 'GET',
                    headers: {
                        'Accept': 'text/plain'
                    }}))); // There is access to the custom SnippedGeneratorNodeJsPlugin.fn here
                console.log(system.requestSnippets);
            }
        };
    };

    // Placed in RDF4J config
    const Rdf4jButton = function () {
        return {
            statePlugins: {
                spec: {
                    wrapActions: {
                        // Wrap Actions allow you to override the behavior of an action in the system
                        // Will add a button on every 'Execute' click, as that is when logRequest happens
                        logRequest: (oriAction, system) => (str) => {
                            const button = document.createElement('button');
                            button.textContent = 'Generate cURL';
                            button.className = 'btn';
                            button.style.margin = '2.5px';
                            button.addEventListener('click', () => console.log(system.fn.requestSnippetGenerator_curl_bash(JSON.stringify({
                                url: 'http://localhost:9000/repositories/news/size',
                                method: 'GET',
                                headers: {
                                    'Accept': 'text/plain'
                                }})))); // Uses s=>curlify(s,escapeCMD,"^\n")
                            const parentElement = document.querySelectorAll('.swagger-ui .try-out');
                            parentElement.forEach((element) => element.appendChild(button));
                            console.log(document.querySelector('input'));
                            console.log(system.oas3Selectors.requestContentType('http://localhost:9000/repositories/news/size', 'GET'));
                            console.log(system.specSelectors.getOAS3RequiredRequestBodyContentType(['http://localhost:9000/repositories/news/size', 'GET']));
                            return oriAction(str); // don't forget! otherwise, Swagger UI won't update
                        }/*,
                        wrapSelectors: { //Selectors reach into their namespace's state to retrieve or derive data from the state.
                            allowTryItOutFor: (ori, system) => (...args) => {
                                const button = document.createElement('button');
                                button.textContent = 'cURL Btn wrap';
                                button.className = 'btn';
                                button.style.margin = '2.5px';
                                button.addEventListener('click', () => console.log(system));
                                console.log('wrapSelectors');
                                const parentElement = document.querySelector('.swagger-ui .opblock .try-out');
                                //const BaseLayout = getComponent("BaseLayout", true);
                                parentElement.appendChild(button);
                            }
                        }*/
                    }
                }
            },
            components: {
                // You can provide a map of components to be integrated into the system. (only React?)
                // Can't seem to integrate this into the view
                ButtonComponent: () => {
                    const button = document.createElement('button');
                    button.textContent = 'cURL Btn components';
                    button.className = 'btn';
                    button.style.margin = '2.5px';
                    button.addEventListener('click', () => console.log('Button Component'));
                    console.log('Button component');
                    const parentElement = document.querySelector('.swagger-ui .opblock .try-out');
                    parentElement.appendChild(button);
                    return button;
                }
            },
            afterLoad(system) {
                // When Swagger has loaded, the panels are collapsed, so using querySelector to get any elements inside
                // to add a button doesn't seem to work
                this.rootInjects = this.rootInjects || {};
                console.log('afterLoad Rdf2j');
                console.log(system);
            }
        };
    };

    // The 'Execute' button takes the form input, validates it and executes the request.
    // The curl component generates the cURL with 'requestSnippetGenerator_curl_bash(request)'
    // Request snippets seem to be one option to generate the cURL. However, access to the form fields is needed.
    // *** From their example on request snippets https://github.com/swagger-api/swagger-ui/blob/master/docs/customization/plug-points.md#request-snippets
    const snippetConfig = {
        requestSnippetsEnabled: true,
        requestSnippets: {
            generators: {
                "node_native": {
                    title: "NodeJs Native",
                    syntax: "javascript"
                },
                "curl": {
                    title: "cURL",
                    syntax: "javascript"
                }
            }
        }
    };

    const SnippedGeneratorNodeJsPlugin = {
        fn: {
            // use `requestSnippetGenerator_` + key from config (node_native) for generator fn
            requestSnippetGenerator_curl: (requestString) => {
                const request = JSON.parse(requestString);
                const url = new URL('http://localhost:9000/repositories/news/size');
                let isMultipartFormDataRequest = false;
                const headers = 'text/plain';
                const method = 'GET';
                if (headers && headers.size) {
                    request.get("headers").map((val, key) => {
                        isMultipartFormDataRequest = isMultipartFormDataRequest || /^content-type$/i.test(key) && /^multipart\/form-data$/i.test(val);
                    });
                }
                const packageStr = url.protocol === "https:" ? "https" : "http";
                let reqBody = '';
                if (reqBody) {
                    if (isMultipartFormDataRequest && ["POST", "PUT", "PATCH"].includes(method)) {
                        return "throw new Error(\"Currently unsupported content-type: /^multipart\\/form-data$/i\");";
                    } else {
                        if (!Map.isMap(reqBody)) {
                            if (typeof reqBody !== "string") {
                                reqBody = JSON.stringify(reqBody);
                            }
                        } else {
                            reqBody = getStringBodyOfMap(request);
                        }
                    }
                } else if (!reqBody && method === "POST") {
                    reqBody = "";
                }

                const stringBody = "`" + (reqBody || "")
                        .replace(/\\n/g, "\n")
                        .replace(/`/g, "\\`")
                    + "`";

                return `const http = require("${packageStr}");
                const options = {
                  "method": "${method}",
                  "hostname": "${url.host}",
                  "port": ${url.port || "null"},
                  "path": "${url.pathname}"${headers && headers.size ? `,
                  "headers": {
                    ${request.get("headers").map((val, key) => `"${key}": "${val}"`).valueSeq().join(",\n    ")}
                  }` : ""}
                };
                const req = http.request(options, function (res) {
                  const chunks = [];
                  res.on("data", function (chunk) {
                    chunks.push(chunk);
                  });
                  res.on("end", function () {
                    const body = Buffer.concat(chunks);
                    console.log(body.toString());
                  });
                });
                ${reqBody ? `\nreq.write(${stringBody});` : ""}
                req.end();`;
            }
        }
    };

    window.uiRdf4j = SwaggerUIBundle({
        url: "../../rest/api/rdf4j",
        name: "RDF4J API",
        dom_id: '#swagger-ui-container-rdf4j',
        deepLinking: true,
        docExpansion: 'none',
        defaultModelRendering: 'example',
        snippetConfig,
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
            Rdf4jButton
        ],
        layout: "StandaloneLayout"
    });

    window.uiWB = SwaggerUIBundle({
        url: "../../rest/api/workbench",
        name: "GraphDB API",
        dom_id: '#swagger-ui-container-graphdb',
        deepLinking: true,
        docExpansion: 'none',
        defaultModelRendering: 'example',
        snippetConfig,
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
            WBApiButton,
            SnippedGeneratorNodeJsPlugin
        ],
        layout: "StandaloneLayout"
    });
};
