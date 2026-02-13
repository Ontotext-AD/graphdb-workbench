import {Routes} from '@angular/router';
import {SparqlComponent} from './sparql/sparql.component';
import {NotFoundPageComponent} from './pages/not-found/not-found-page.component';
import {LoginPageComponent} from './pages/login/login-page.component';
import {NewViewComponent} from './new-view/new-view.component';
import {UxTestPageComponent} from './pages/ux-test/ux-test-page.component';

export const routes: Routes = [
  {path: 'sparql-new', component: SparqlComponent},
  {path: 'new-view', component: NewViewComponent},
  {path: 'login', component: LoginPageComponent},
  {path: 'ux-test', component: UxTestPageComponent},
  {path: '**', component: NotFoundPageComponent}
];
