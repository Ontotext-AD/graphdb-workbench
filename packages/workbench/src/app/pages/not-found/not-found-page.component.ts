import { Component } from '@angular/core';
import {TranslocoPipe} from '@jsverse/transloco';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [
    TranslocoPipe,
    RouterLink
  ],
  templateUrl: './not-found-page.component.html'
})
export class NotFoundPageComponent {

}
