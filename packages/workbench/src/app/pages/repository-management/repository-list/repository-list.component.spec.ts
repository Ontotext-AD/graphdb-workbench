import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryListComponent } from './repository-list.component';
import {provideRouter} from '@angular/router';
import {provideTranslocoForTesting} from '../../../../testing-utils/transloco-utils';

describe('RepositoryListComponent', () => {
  let component: RepositoryListComponent;
  let fixture: ComponentFixture<RepositoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RepositoryListComponent,
        provideTranslocoForTesting()
      ],
      providers: [
        provideRouter([]),
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RepositoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
