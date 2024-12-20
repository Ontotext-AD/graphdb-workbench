import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
// import {EmptyRouteComponent} from './empty-route/empty-route.component';
import {APP_BASE_HREF} from '@angular/common';
import {GraphqlPlaygroundComponent} from "./graphql-playground/graphql-playground.component";
import {GraphqlManagementComponent} from "./graphql-management/graphql-management.component";

const routes: Routes = [
  { path: 'graphql/management', component: GraphqlManagementComponent },
  { path: 'graphql/playground', component: GraphqlPlaygroundComponent },
  // {path: "**", component: EmptyRouteComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}]
})
export class AppRoutingModule { }
