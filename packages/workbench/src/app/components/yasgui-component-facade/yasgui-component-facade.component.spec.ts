import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YasguiComponentFacadeComponent } from './yasgui-component-facade.component';

describe('YasguiComponentFacadeComponent', () => {
  let component: YasguiComponentFacadeComponent;
  let fixture: ComponentFixture<YasguiComponentFacadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YasguiComponentFacadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YasguiComponentFacadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
