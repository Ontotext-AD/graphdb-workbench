import singleSpaAngularJS from "single-spa-angularjs";

import './vendor';
import './main';
import './app';

import angular from "angular";

const domElementGetter = () => {
    const el = document.getElementById('single-spa-application:@ontotext/legacy-workbench');
    const rootEl = document.createElement('div');
    rootEl.id = 'workbench-app';
    el.appendChild(rootEl);

    const main = document.createElement('div');
    main.setAttribute("ng-controller", 'mainCtrl');
    rootEl.appendChild(main);

    const mainContainer = document.createElement("div");
    mainContainer.classList.add('main-container');
    main.appendChild(mainContainer);

    const htmlDivElement = document.createElement('div');
    htmlDivElement.setAttribute('ng-view', '');
    mainContainer.appendChild(htmlDivElement);
    return el;
};

const ngLifecycles = singleSpaAngularJS({
    angular: angular,
    mainAngularModule: "graphdb.workbench",
    ngRoute: true,
    preserveGlobal: false
});

export const bootstrap = (props) => {
    // The usage of the generated bootstrap is commented out because it triggers the initialization of angular
    // In the workbench case, we configure the workbench and bootstrap it in the app.js file.
    // return ngLifecycles.bootstrap(props);
    return Promise.resolve();
};

export const mount = (props) => {
    return Promise.resolve()
        .then(() => {
            domElementGetter();
        });
};

export const unmount = (props) => {
    return ngLifecycles.unmount(props);
};
