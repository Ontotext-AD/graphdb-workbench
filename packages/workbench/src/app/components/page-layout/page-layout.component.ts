import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {ApplicationQueryParams} from '../../models/application-query-params';
import {TranslocoPipe} from '@jsverse/transloco';
import {PageInfoTooltipComponent} from '../page-info-tooltip/page-info-tooltip.component';
import {PageRestrictionsComponent} from '../page-restrictions/page-restrictions.component';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoPipe,
    PageInfoTooltipComponent,
    PageRestrictionsComponent
  ],
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.scss'
})
export class PageLayoutComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);

  embedded = signal(false);
  title = signal<string | undefined>(undefined);
  helpInfo = signal<string | undefined>(undefined);
  documentationLink = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.getPageData();
    const queryParams = this.activatedRoute.snapshot.queryParams;
    if (queryParams.hasOwnProperty(ApplicationQueryParams.EMBEDDED)) {
      this.embedded.set(true);
    }
  }

  private getPageData(): void {
    const routeData = this.activatedRoute.snapshot.data;
    this.title.set(routeData['title']);
    this.helpInfo.set(routeData['helpInfo']);
    this.documentationLink.set(routeData['documentationLink']);
  }
}
