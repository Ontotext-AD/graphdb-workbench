import {Routes} from '@angular/router';
import {SparqlComponent} from './sparql/sparql.component';
import {GraphqlComponent} from './graphql/graphql.component';
import {EmptyRouteComponent} from './empty-route/empty-route.component';

export const routes: Routes = [
  {path: 'sparql-new', component: SparqlComponent},
  {path: 'graphql', component: GraphqlComponent},
  {path: "**", component: EmptyRouteComponent}
];
