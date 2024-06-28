import singleSpaAngularJS from "single-spa-angularjs";

import './vendor';
import './main';
import './app';

import angular from "angular";

const domElementGetter = () => {
    let el = document.getElementById('workbench-app');
    if (!el) {
        el = document.createElement('div');
        el.id = 'workbench-app';
        document.body.appendChild(el);
        let main = document.createElement('div');

        main.setAttribute("ng-controller", 'mainCtrl')
        el.appendChild(main);

        let mainContainer = document.createElement("div");
        mainContainer.classList.add('main-container');
        main.appendChild(mainContainer);

        let htmlDivElement = document.createElement('div');
        htmlDivElement.setAttribute('ng-view', '');
        mainContainer.appendChild(htmlDivElement);
    }
    return el;
}

console.log('Workbench angular', angular);

const ngLifecycles = singleSpaAngularJS({
    angular: angular,
    mainAngularModule: "graphdb.workbench",
    ngRoute: true,
    preserveGlobal: false,
    template: `<div ng-controller="mainCtrl" lang="en">
                    <h1>I am the workbench</h1>
                    <div class="main-container">
                    <div ng-view></div>
                    </div>
                </div>`,
    domElementGetter
});

export const bootstrap = (props) => {
    console.log("WORKBENCH app bootstrapped");
    // The usage of the generated bootstrap is commented out because it triggers the initialization of angular
    // In the workbench case, we configure the workbench and bootstrap it in the app.js file.
    // return ngLifecycles.bootstrap(props);
    return Promise.resolve();
};

export const mount = (props) => {
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log('WORKBENCH app mounted');
    return Promise.resolve()
        .then(() => {
            domElementGetter();
        });
};

export const unmount = (props) => {
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log('WORKBENCH app unmounted');
    return ngLifecycles.unmount(props);
};
