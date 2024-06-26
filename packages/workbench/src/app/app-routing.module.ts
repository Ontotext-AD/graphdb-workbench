import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import {EmptyRouteComponent} from './empty-route/empty-route.component';
import {APP_BASE_HREF} from '@angular/common';
import {SparqlComponent} from "./sparql/sparql.component";
import {GraphqlComponent} from "./graphql/graphql.component";

const routes: Routes = [
  { path: 'sparql', component: SparqlComponent },
  { path: 'graphql', component: GraphqlComponent },
  // {path: "**", component: EmptyRouteComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}]
})
export class AppRoutingModule { }
