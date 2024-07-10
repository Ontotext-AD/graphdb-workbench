import {registerApplication, start, navigateToUrl} from "single-spa";
import {
    constructApplications,
    constructRoutes,
    constructLayoutEngine,
} from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";
import "./styles/styles.css";
import "./styles/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";

// We can also imperatively load and mount the components like this.
// System.import("@ontotext/components").then((components) => {
//     console.log(`COMPONENTS`, components);
//     components.navbar.mount({
//         domElement: document.querySelector(".wb-navbar")
//     });
//     components.footer.mount({
//         domElement: document.querySelector(".wb-footer")
//     });
// });

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

// window.addEventListener("single-spa:routing-event", (evt) => {
//     console.log("single-spa finished mounting/unmounting applications!");
//     console.log(evt.detail.originalEvent); // PopStateEvent
//     console.log(evt.detail.newAppStatuses); // { app1: MOUNTED, app2: NOT_MOUNTED }
//     console.log(evt.detail.appsByNewStatus); // { MOUNTED: ['app1'], NOT_MOUNTED: ['app2'] }
//     console.log(evt.detail.totalAppChanges); // 2
// });

start();
