import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PageLayoutComponent} from './page-layout.component';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';

function buildActivatedRouteMock(queryParams: Record<string, string> = {}, data: Record<string, unknown> = {}) {
  return {
    snapshot: {queryParams, data}
  };
}

describe('PageLayoutComponent', () => {
  let component: PageLayoutComponent;
  let fixture: ComponentFixture<PageLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, CommonModule, provideTranslocoForTesting()],
      providers: [
        {provide: ActivatedRoute, useValue: buildActivatedRouteMock()}
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
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, CommonModule, provideTranslocoForTesting()],
      providers: [
        {provide: ActivatedRoute, useValue: buildActivatedRouteMock({embedded: ''})}
      ]
    }).compileComponents();

    const embeddedFixture = TestBed.createComponent(PageLayoutComponent);
    const embeddedComponent = embeddedFixture.componentInstance;
    embeddedFixture.detectChanges();

    expect(embeddedComponent.embedded()).toBe(true);
  });

  it('should set title from route data', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, CommonModule, provideTranslocoForTesting()],
      providers: [
        {provide: ActivatedRoute, useValue: buildActivatedRouteMock({}, {title: 'my.title.key'})}
      ]
    }).compileComponents();

    const f = TestBed.createComponent(PageLayoutComponent);
    f.detectChanges();

    expect(f.componentInstance.title()).toBe('my.title.key');
  });

  it('should set helpInfo from route data', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, CommonModule, provideTranslocoForTesting()],
      providers: [
        {provide: ActivatedRoute, useValue: buildActivatedRouteMock({}, {helpInfo: 'my.help.key'})}
      ]
    }).compileComponents();

    const f = TestBed.createComponent(PageLayoutComponent);
    f.detectChanges();

    expect(f.componentInstance.helpInfo()).toBe('my.help.key');
  });

  it('should set documentationLink from route data', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, CommonModule, provideTranslocoForTesting()],
      providers: [
        {provide: ActivatedRoute, useValue: buildActivatedRouteMock({}, {documentationLink: 'https://docs.example.com'})}
      ]
    }).compileComponents();

    const f = TestBed.createComponent(PageLayoutComponent);
    f.detectChanges();

    expect(f.componentInstance.documentationLink()).toBe('https://docs.example.com');
  });

  it('should leave title undefined when not in route data', () => {
    expect(component.title()).toBeUndefined();
  });

  it('should leave helpInfo undefined when not in route data', () => {
    expect(component.helpInfo()).toBeUndefined();
  });

  it('should leave documentationLink undefined when not in route data', () => {
    expect(component.documentationLink()).toBeUndefined();
  });

  it('should render the page-errors slot when not embedded', () => {
    const host = fixture.nativeElement as HTMLElement;
    const errorsContainer = host.querySelector('.page-errors-container');
    expect(errorsContainer).not.toBeNull();
  });

  it('should hide the page-errors slot when embedded', () => {
    component.embedded.set(true);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const errorsContainer = host.querySelector('.page-errors-container');
    expect(errorsContainer).toBeNull();
  });
});
