import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryRequiredBannerComponent } from './repository-required-banner.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

describe('RepositoryRequiredBannerComponent', () => {
  let component: RepositoryRequiredBannerComponent;
  let fixture: ComponentFixture<RepositoryRequiredBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepositoryRequiredBannerComponent, provideTranslocoForTesting()],
      providers: [provideNoopAnimations()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RepositoryRequiredBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
