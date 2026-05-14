import {Component, input, OnDestroy, viewChild} from '@angular/core';
import {Popover} from 'primeng/popover';
import {TranslocoPipe} from '@jsverse/transloco';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-page-info-tooltip',
  standalone: true,
  imports: [
    Popover,
    TranslocoPipe,
    Button
  ],
  templateUrl: './page-info-tooltip.component.html',
  styleUrl: './page-info-tooltip.component.scss'
})
export class PageInfoTooltipComponent implements OnDestroy {
  readonly title = input<string>();
  readonly helpInfo = input<string>();
  readonly documentationLink = input<string>();

  private readonly popover = viewChild<Popover>('popover');
  private readonly hideDelayMs = 180;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  show($event: MouseEvent | FocusEvent) {
    this.cancelHide();
    this.popover()?.show($event);
  }

  hide() {
    this.cancelHide();
    this.hideTimeout = setTimeout(() => {
      this.popover()?.hide();
    }, this.hideDelayMs);
  }

  cancelHide() {
    if (!this.hideTimeout) {
      return;
    }

    clearTimeout(this.hideTimeout);
    this.hideTimeout = null;
  }

  ngOnDestroy() {
    this.cancelHide();
  }
}
