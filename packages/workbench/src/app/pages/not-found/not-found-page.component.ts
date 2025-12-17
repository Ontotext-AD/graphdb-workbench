import { Component } from '@angular/core';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [
    TranslocoPipe
  ],
  templateUrl: './not-found-page.component.html'
})
export class NotFoundPageComponent {

}
