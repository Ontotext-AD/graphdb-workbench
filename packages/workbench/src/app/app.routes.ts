import {Routes} from '@angular/router';
import {SparqlComponent} from './sparql/sparql.component';
import {EmptyRouteComponent} from './empty-route/empty-route.component';
import {LoginPageComponent} from './pages/login/login-page.component';
import {NewViewComponent} from './new-view/new-view.component';

export const routes: Routes = [
  {path: 'sparql-new', component: SparqlComponent},
  {path: 'new-view', component: NewViewComponent},
  {path: 'login', component: LoginPageComponent},
  {path: '**', component: EmptyRouteComponent}
];
