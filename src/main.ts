import './css/angular-tooltips.css';
import './css/bootstrap-graphdb-theme.css';
import './css/bootstrap-graphdb-theme-dark-auto.css';
import './css/workbench-custom.css';
import './less/core.less';
import './less/owlim-workbench.less';

import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {UpgradeModule} from "@angular/upgrade/static";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
// import {bootstrapApplication} from '@angular/platform-browser';
// import {AppComponent} from './app/app.component';

@NgModule({
    imports: [
        BrowserModule,
        UpgradeModule,
    ]
})
class AppModule {
    ngDoBootstrap() {
    }
}

platformBrowserDynamic().bootstrapModule(AppModule).then(platformRef => {
    console.log(`Run it in Hybrid mode`, );
    const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
    upgrade.bootstrap(document.body, ['graphdb']);
});

// bootstrapApplication(AppComponent, {providers: []}).catch((err) =>
//     console.error(err),
// );
