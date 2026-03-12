import {Component, input, OnInit} from '@angular/core';
import {OntotextYasguiConfig} from './models/ontotext-yasgui-config';

@Component({
  selector: 'app-yasgui-component-facade',
  imports: [],
  templateUrl: './yasgui-component-facade.component.html',
  styleUrls: [
    './yasgui-component-facade.component.scss',
    './codemirror/moxer.css',
  ]
})
export class YasguiComponentFacadeComponent implements OnInit {
  yasguiConfig = input<OntotextYasguiConfig>();

  afterInit: unknown;

  queryChanged: unknown;

  ngOnInit(): void {
    console.log('%cconfig', 'background: tan', this.yasguiConfig);
  }
}
