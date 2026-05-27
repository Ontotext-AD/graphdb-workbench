import {Component} from '@angular/core';
import {TranslocoPipe} from '@jsverse/transloco';
import {MessageModule} from 'primeng/message';

@Component({
  selector: 'app-repository-required-banner',
  imports: [
    TranslocoPipe,
    MessageModule
  ],
  templateUrl: './repository-required-banner.component.html',
  styleUrl: './repository-required-banner.component.scss',
})
export class RepositoryRequiredBannerComponent {

}
