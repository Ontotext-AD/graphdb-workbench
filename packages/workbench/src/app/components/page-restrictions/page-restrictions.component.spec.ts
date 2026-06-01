import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PageRestrictionsComponent } from './page-restrictions.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';

describe('PageRestrictionsComponent', () => {
  let component: PageRestrictionsComponent;
  let fixture: ComponentFixture<PageRestrictionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageRestrictionsComponent, provideTranslocoForTesting()],
      providers: [provideRouter([])],
    })
      .compileComponents();

    fixture = TestBed.createComponent(PageRestrictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
