import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PageLayoutComponent} from './page-layout.component';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';

describe('PageLayoutComponent', () => {
  let component: PageLayoutComponent;
  let fixture: ComponentFixture<PageLayoutComponent>;

  beforeEach(async () => {
    const activatedRouteMock = {
      snapshot: {queryParams: {}}
    };

    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, CommonModule],
      providers: [
        {provide: Router, useValue: {}},
        {provide: ActivatedRoute, useValue: activatedRouteMock}
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PageLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set embedded to false when the embedded query parameter is not present', () => {
    expect(component.embedded()).toBe(false);
  });

  it('should show the title container when not embedded', () => {
    const titleContainer = fixture.nativeElement.querySelector('.title-container');
    expect(titleContainer).not.toBeNull();
  });

  it('should hide the title container when embedded', () => {
    component.embedded.set(true);
    fixture.detectChanges();
    const titleContainer = fixture.nativeElement.querySelector('.title-container');
    expect(titleContainer).toBeNull();
  });

  it('should set embedded to true when the embedded query parameter is present', async () => {
    const activatedRouteMock = {
      snapshot: {queryParams: {embedded: ''}}
    };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, CommonModule],
      providers: [
        {provide: Router, useValue: {}},
        {provide: ActivatedRoute, useValue: activatedRouteMock}
      ]
    }).compileComponents();

    const embeddedFixture = TestBed.createComponent(PageLayoutComponent);
    const embeddedComponent = embeddedFixture.componentInstance;
    embeddedFixture.detectChanges();

    expect(embeddedComponent.embedded()).toBe(true);
  });
});
