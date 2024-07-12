import {registerApplication, start, navigateToUrl, addErrorHandler, getAppStatus} from "single-spa";
import {
    constructApplications,
    constructRoutes,
    constructLayoutEngine,
} from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";
import "./styles/styles.css";
import "./styles/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
// import "./styles/bootstrap-graphdb-theme.css";
import {defineCustomElements} from "../../shared-components/loader";

addErrorHandler((err) => {
    console.log(err);
    console.log(err.appOrParcelName);
    console.log(getAppStatus(err.appOrParcelName));
});

const routes = constructRoutes(microfrontendLayout);
const applications = constructApplications({
    routes,
    loadApp({name}) {
        if (!name.includes('.')) {
            return System.import(name);
        } else {
            // This allows us to load submodules exported in a namespace-like fashion. For example: "@ontotext/components.navbar".
            const [module, exported] = name.split('.', 2);
            return System.import(module).then((module) => module[exported]);
        }
    },
});

const layoutEngine = constructLayoutEngine({routes, applications});

applications.forEach(registerApplication);
layoutEngine.activate();

defineCustomElements();

// This is one way to pass properties to the custom elements.
window.addEventListener("single-spa:first-mount", () => {
    // const navbar = document.querySelector('onto-navbar');
    // if (navbar) {
    //     navbar.menuModel = PluginRegistry.get('main.menu');
    // } else {
    //     console.error('onto-navbar element not found');
    // }
});

// window.addEventListener("single-spa:routing-event", (evt) => {
//     console.log("single-spa finished mounting/unmounting applications!");
//     console.log(evt.detail.originalEvent); // PopStateEvent
//     console.log(evt.detail.newAppStatuses); // { app1: MOUNTED, app2: NOT_MOUNTED }
//     console.log(evt.detail.appsByNewStatus); // { MOUNTED: ['app1'], NOT_MOUNTED: ['app2'] }
//     console.log(evt.detail.totalAppChanges); // 2
// });

start();
