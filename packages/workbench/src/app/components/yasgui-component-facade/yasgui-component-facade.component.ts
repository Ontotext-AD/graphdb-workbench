import {Component, CUSTOM_ELEMENTS_SCHEMA, input, ViewEncapsulation} from '@angular/core';
import {defineCustomElements} from 'ontotext-yasgui-web-component/loader';
import {OntotextYasguiConfig} from './models/yasgui/ontotext-yasgui-config';

defineCustomElements();

@Component({
  selector: 'app-yasgui-component-facade',
  standalone: true,
  // We need to disable encapsulation for the yasgui-component css overrides to be applied
  encapsulation: ViewEncapsulation.None,
  imports: [],
  templateUrl: './yasgui-component-facade.component.html',
  styleUrls: [
    './codemirror/moxer.css',
    './yasgui-component-facade.component.scss',
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: {
    '[class]': 'cssClass()'
  }
})
export class YasguiComponentFacadeComponent {
  yasguiConfig = input<OntotextYasguiConfig>();
  cssClass = input<string>('');

  afterInit: unknown;

  queryChanged: unknown;
}
