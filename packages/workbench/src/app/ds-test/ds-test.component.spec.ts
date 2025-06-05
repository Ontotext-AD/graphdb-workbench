import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsTestComponent } from './ds-test.component';

describe('DsTestComponent', () => {
  let component: DsTestComponent;
  let fixture: ComponentFixture<DsTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DsTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
