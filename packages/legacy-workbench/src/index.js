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
    preserveGlobal: false,
    domElementGetter
});

export const bootstrap = ngLifecycles.bootstrap;
export const mount = ngLifecycles.mount;
export const unmount = ngLifecycles.unmount;
