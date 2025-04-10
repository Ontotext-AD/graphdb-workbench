import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewViewComponent } from './new-view.component';

describe('NewViewComponent', () => {
  let component: NewViewComponent;
  let fixture: ComponentFixture<NewViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
