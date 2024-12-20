import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {RouterOutlet} from '@angular/router';
import {GraphqlManagementComponent} from "./graphql-management/graphql-management.component";
import {GraphqlPlaygroundComponent} from "./graphql-playground/graphql-playground.component";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterOutlet,
    GraphqlManagementComponent,
    GraphqlPlaygroundComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
