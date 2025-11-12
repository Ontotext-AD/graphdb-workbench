import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewViewComponent } from './new-view.component';
import {provideTranslocoForTesting} from '../../testing-utils/transloco-utils';

describe('NewViewComponent', () => {
  let component: NewViewComponent;
  let fixture: ComponentFixture<NewViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewViewComponent, provideTranslocoForTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
