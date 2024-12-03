const defaultOpts = {
    // required opts
    angular: null,
    domElementGetter: null,
    mainAngularModule: null,

    // optional opts
    uiRouter: false,
    ngRoute: false,
    preserveGlobal: false,
    elementId: "__single_spa_angular_1",
    strictDi: false,
    template: undefined,
};

export default function singleSpaAngularJS(userOpts) {
    console.log('spa:start', userOpts);
    if (typeof userOpts !== "object") {
        throw new Error(`single-spa-angularjs requires a configuration object`);
    }

    const opts = {
        ...defaultOpts,
        ...userOpts,
    };

    if (!opts.angular) {
        throw new Error(`single-spa-angularjs must be passed opts.angular`);
    }

    if (!opts.mainAngularModule) {
        throw new Error(
            `single-spa-angularjs must be passed opts.mainAngularModule string`
        );
    }

    // A shared object to store mounted object state
    const mountedInstances = {};

    return {
        bootstrap: bootstrap.bind(null, opts, mountedInstances),
        mount: mount.bind(null, opts, mountedInstances),
        unmount: unmount.bind(null, opts, mountedInstances),
    };
}

function bootstrap(opts, mountedInstances, singleSpaProps) {
    console.log('spa:bootstrap', opts, mountedInstances, singleSpaProps);
    return Promise.resolve().then(() => {
        let module;
        try {
            module = opts.angular.module("single-spa-angularjs");
        } catch (err) {
            // ignore - this means that the module doesn't exist
        }
        if (module) {
            module.config([
                "$provide",
                ($provide) => {
                    $provide.value("singleSpaProps", singleSpaProps);
                },
            ]);
        }
    });
}

function mount(opts, mountedInstances, props = {}) {
    console.log('spa:mount', opts, mountedInstances, props);
    return Promise.resolve().then(() => {
        window.angular = opts.angular;

        const domElementGetter = chooseDomElementGetter(opts, props);
        const domElement = getRootDomEl(domElementGetter, props);
        const bootstrapEl = document.createElement("div");
        bootstrapEl.id = opts.elementId;

        domElement.appendChild(bootstrapEl);

        if (opts.uiRouter) {
            const uiViewEl = document.createElement("div");
            uiViewEl.setAttribute(
                "ui-view",
                opts.uiRouter === true ? "" : opts.uiRouter
            );
            bootstrapEl.appendChild(uiViewEl);
        }

        if(opts.ngRoute){
            const ngViewEl = document.createElement("div");
            ngViewEl.setAttribute(
                "ng-view",""
            );
            bootstrapEl.appendChild(ngViewEl);
        }

        if (opts.template) {
            bootstrapEl.innerHTML = opts.template;
        }

        if (opts.strictDi) {
            mountedInstances.instance = opts.angular.bootstrap(
                bootstrapEl,
                [opts.mainAngularModule],
                { strictDi: opts.strictDi }
            );
        } else {
            props.initApplication()
                .then((instance) => {
                    mountedInstances.instance = instance;
                    console.log(`spa:cache instance`, mountedInstances.instance, opts);
                    mountedInstances.instance.get("$rootScope").singleSpaProps = props;

                    // https://github.com/single-spa/single-spa-angularjs/issues/51
                    mountedInstances.instance.get("$rootScope").$apply();
                });
            // mountedInstances.instance = opts.angular.bootstrap(bootstrapEl, [
            //     opts.mainAngularModule,
            // ]);
        }

        // mountedInstances.instance.get("$rootScope").singleSpaProps = props;
        //
        // // https://github.com/single-spa/single-spa-angularjs/issues/51
        // mountedInstances.instance.get("$rootScope").$apply();
    });
}

function unmount(opts, mountedInstances, props = {}) {
    console.log('spa:unmount', opts, mountedInstances, props);
    return new Promise((resolve, reject) => {
        if (mountedInstances.instance.has("$uiRouter")) {
            // https://github.com/single-spa/single-spa-angularjs/issues/53
            const uiRouter = mountedInstances.instance.get("$uiRouter");
            if (uiRouter.dispose) {
                uiRouter.dispose();
            } else {
                console.warn(
                    "single-spa-angularjs: the uiRouter instance doesn't have a dispose method and so it will not be properly unmounted."
                );
            }
        }

        const domElementGetter = chooseDomElementGetter(opts, props);
        const domElement = getRootDomEl(domElementGetter, props);

        // const translateModule = opts.angular.module('pascalprecht.translate');
        // console.log(`%copts.angular:`, 'background: red', translateModule);
        // translateModule.filter('translate', function() {
        //     console.log(`%cremove filter:`, 'background: plum', );
        //     return function(input) {
        //         return input; // No-op: Just return the input unchanged
        //     };
        // });

        if (mountedInstances.instance) {
            const rootScope = mountedInstances.instance.get("$rootScope");
            if (rootScope) {
                rootScope.$broadcast("$destroy");
            }
        }
        // mountedInstances.instance.get("$rootScope").$destroy();

        // Remove the AngularJS module from the registry
        console.log(`%cremove module:`, 'background: plum', opts.mainAngularModule);
        if (opts.mainAngularModule) {
            window.angular.module(opts.mainAngularModule)._invokeQueue.length = 0;
            window.angular.module(opts.mainAngularModule)._configBlocks.length = 0;
            window.angular.module(opts.mainAngularModule)._runBlocks.length = 0;
            delete window.angular.module(opts.mainAngularModule);
        }
        console.log(`%cremoved module:`, 'background: plum', window.angular.module(opts.mainAngularModule));

        const appEl = document.getElementById('workbench-app')
        angular.element(appEl).off();
        angular.element(appEl).remove();

        domElement.innerHTML = "";

        if (opts.angular === window.angular && !opts.preserveGlobal) {
            // TODO: Don't remove angular for now because it causes errors in angular-translate module when legacy-workbench is unmounted
            // because it expects angular to be available.
            // TODO: Find a way to destroy the angular-translate module properly.
            // delete window.angular;
        }

        setTimeout(resolve);
    });
}

function chooseDomElementGetter(opts, props) {
    if (props.domElement) {
        return () => props.domElement;
    } else if (props.domElementGetter) {
        return props.domElementGetter;
    } else if (opts.domElementGetter) {
        return opts.domElementGetter;
    } else {
        return defaultDomElementGetter(props);
    }
}

function defaultDomElementGetter(props) {
    const appName = props.appName || props.name;
    if (!appName) {
        throw Error(
            `single-spa-angularjs was not given an application name as a prop, so it can't make a unique dom element container for the angularjs application`
        );
    }
    const htmlId = `single-spa-application:${appName}`;

    return function defaultDomEl() {
        let domElement = document.getElementById(htmlId);
        if (!domElement) {
            domElement = document.createElement("div");
            domElement.id = htmlId;
            document.body.appendChild(domElement);
        }

        return domElement;
    };
}

function getRootDomEl(domElementGetter, props) {
    if (typeof domElementGetter !== "function") {
        throw new Error(
            `single-spa-angularjs: the domElementGetter for angularjs application '${
                props.appName || props.name
            }' is not a function`
        );
    }

    const element = domElementGetter(props);

    if (!element) {
        throw new Error(
            `single-spa-angularjs: domElementGetter function for application '${
                props.appName || props.name
            }' did not return a valid dom element. Please pass a valid domElement or domElementGetter via opts or props`
        );
    }

    return element;
}
