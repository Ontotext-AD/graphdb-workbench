import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterOutlet } from '@angular/router';
import {SparqlComponent} from "./sparql/sparql.component";
import {GraphqlComponent} from "./graphql/graphql.component";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterOutlet,
    SparqlComponent,
    GraphqlComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
