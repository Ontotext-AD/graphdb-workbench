import {Component, inject, input, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {ApplicationQueryParams} from '../../models/application-query-params';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.scss'
})
export class PageLayoutComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  title = input('');
  embedded = signal(false);

  ngOnInit(): void {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    if (queryParams.hasOwnProperty(ApplicationQueryParams.EMBEDDED)) {
      this.embedded.set(true);
    }
  }
}
