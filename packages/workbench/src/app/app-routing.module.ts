import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import {EmptyRouteComponent} from './empty-route/empty-route.component';
import {APP_BASE_HREF} from '@angular/common';
import {SparqlComponent} from "./sparql/sparql.component";
import {GraphqlComponent} from "./graphql/graphql.component";
import {GraphqlManagementComponent} from "./graphql-management/graphql-management.component";

const routes: Routes = [
  { path: 'graphql', component: GraphqlComponent },
  { path: 'graphql-management', component: GraphqlManagementComponent },
  // {path: "**", component: EmptyRouteComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}]
})
export class AppRoutingModule { }
