import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageInfoTooltipComponent } from './page-info-tooltip.component';

describe('PageInfoTooltipComponent', () => {
  let component: PageInfoTooltipComponent;
  let fixture: ComponentFixture<PageInfoTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageInfoTooltipComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PageInfoTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
