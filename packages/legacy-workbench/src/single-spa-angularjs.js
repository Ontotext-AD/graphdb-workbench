import {
    ContextSubscriptionManager,
    HTTP_REQUEST_DONE_EVENT,
    ServiceProvider,
    service,
    EventService,
    ApplicationMounted,
    ApplicationUnmounted,
} from "@ontotext/workbench-api";
import {LoggerProvider} from "./js/angular/core/services/logger-provider";

const logger = LoggerProvider.logger;
let angularJsElement;

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
    subscriptions: [],
};

export default function singleSpaAngularJS(userOpts) {
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
            `single-spa-angularjs must be passed opts.mainAngularModule string`,
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
    return Promise.resolve().then(() => {
        let module;
        try {
            module = opts.angular.module("single-spa-angularjs");
        } catch (err) {
            // ignore - this means that the module doesn't exist
            logger.warn(err);
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
    return Promise.resolve().then(() => {
        const domElementGetter = chooseDomElementGetter(opts, props);
        const domElement = getRootDomEl(domElementGetter, props);

        const triggerDigest = () => {
            const $timeout = mountedInstances.instance?.get('$timeout');
            const $rootScope = mountedInstances.instance?.get('$rootScope');

            if ($timeout && $rootScope) {
                $timeout(() => {
                    $rootScope.$apply();
                });
            }
        };

        const subscribeToHttpRequests = () => {
            document.body.addEventListener(HTTP_REQUEST_DONE_EVENT, triggerDigest);
            return () => document.body.removeEventListener(HTTP_REQUEST_DONE_EVENT, triggerDigest);
        };

        const unsubscribeToAllContexts = ServiceProvider.get(ContextSubscriptionManager)
            .subscribeToAllRegisteredContexts(() => {}, undefined, triggerDigest);
        opts.subscriptions.push(unsubscribeToAllContexts);
        opts.subscriptions.push(subscribeToHttpRequests());

        if (angularJsElement) {
            domElement.appendChild(angularJsElement);
            // Fire the mounted event when re-attaching the existing element.
            // This is needed for cases where the angularjs app is kept in the DOM between mounts because
            // single-spa's app-change and before-app-change are somewhat unreliable for our needs.
            // We can use this to re-subscribe to events or do other necessary work when the app is re-mounted.
            service(EventService).emit(new ApplicationMounted());
            return;
        }

        window.angular = opts.angular;

        const bootstrapEl = document.createElement("div");
        bootstrapEl.id = opts.elementId;

        domElement.appendChild(bootstrapEl);

        if (opts.uiRouter) {
            const uiViewEl = document.createElement("div");
            uiViewEl.setAttribute(
                "ui-view",
                opts.uiRouter === true ? "" : opts.uiRouter,
            );
            bootstrapEl.appendChild(uiViewEl);
        }

        if (opts.ngRoute) {
            const ngViewEl = document.createElement("div");
            ngViewEl.setAttribute("ng-view", "");
            bootstrapEl.appendChild(ngViewEl);
        }

        if (opts.template) {
            bootstrapEl.innerHTML = opts.template;
        }

        if (opts.strictDi) {
            mountedInstances.instance = opts.angular.bootstrap(
                bootstrapEl,
                [opts.mainAngularModule],
                {strictDi: opts.strictDi},
            );
        } else {
            return props.initApplication()
                .then((instance) => {
                    mountedInstances.instance = instance;
                    mountedInstances.instance.get("$rootScope").singleSpaProps = props;

                    // https://github.com/single-spa/single-spa-angularjs/issues/51
                    mountedInstances.instance.get("$rootScope").$apply();
                });
        }
    });
}

function unmount(opts, mountedInstances, props = {}) {
    return new Promise((resolve) => {
        const domElementGetter = chooseDomElementGetter(opts, props);
        const domElement = getRootDomEl(domElementGetter, props);

        if (!angularJsElement) {
            angularJsElement = domElement.firstChild;
        }

        if (angularJsElement) {
            angularJsElement.remove();
        }

        if (opts.subscriptions?.length) {
            opts.subscriptions.forEach((unsubscribe) => unsubscribe());
            opts.subscriptions = [];
        }

        // Emit the unmounted event so that any necessary cleanup can be done by the application.
        // For example, unsubscribing from specific events in the AngularJS app which usually are not unsubscribed
        // when the AngularJS app is just removed from the DOM.
        service(EventService).emit(new ApplicationUnmounted());
        resolve();
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
            `single-spa-angularjs was not given an application name as a prop, so it can't make a unique dom element container for the angularjs application`,
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
            }' is not a function`,
        );
    }

    const element = domElementGetter(props);

    if (!element) {
        throw new Error(
            `single-spa-angularjs: domElementGetter function for application '${
                props.appName || props.name
            }' did not return a valid dom element. Please pass a valid domElement or domElementGetter via opts or props`,
        );
    }

    return element;
}
