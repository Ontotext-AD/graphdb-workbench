import {Component} from '@angular/core';
import {PageLayoutComponent} from '../../components/page-layout/page-layout.component';
import {MessageModule} from 'primeng/message';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-sparql-editor-page',
  standalone: true,
  imports: [
    TranslocoPipe,
    MessageModule,
    PageLayoutComponent
  ],
  templateUrl: './sparql-editor-page.component.html',
  styleUrl: './sparql-editor-page.component.scss',
})
export class SparqlEditorPageComponent {

}
