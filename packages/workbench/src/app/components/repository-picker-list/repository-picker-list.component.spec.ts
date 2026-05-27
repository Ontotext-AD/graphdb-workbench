import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryPickerListComponent } from './repository-picker-list.component';

describe('RepositoryPickerListComponent', () => {
  let component: RepositoryPickerListComponent;
  let fixture: ComponentFixture<RepositoryPickerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepositoryPickerListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RepositoryPickerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
