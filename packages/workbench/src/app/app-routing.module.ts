import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {APP_BASE_HREF} from '@angular/common';
import {SparqlComponent} from "./sparql/sparql.component";
import {GraphqlComponent} from "./graphql/graphql.component";

const routes: Routes = [
  { path: 'sparql', component: SparqlComponent },
  { path: 'graphql', component: GraphqlComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}]
})
export class AppRoutingModule { }
