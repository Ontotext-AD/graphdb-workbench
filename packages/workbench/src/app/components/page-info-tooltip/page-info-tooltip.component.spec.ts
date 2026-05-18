import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ComponentRef} from '@angular/core';

import {PageInfoTooltipComponent} from './page-info-tooltip.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';

describe('PageInfoTooltipComponent', () => {
  let component: PageInfoTooltipComponent;
  let fixture: ComponentFixture<PageInfoTooltipComponent>;
  let componentRef: ComponentRef<PageInfoTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageInfoTooltipComponent, provideTranslocoForTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(PageInfoTooltipComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('DOM', () => {
    it('should render the trigger button', () => {
      const button = fixture.nativeElement.querySelector('p-button.page-info-icon');
      expect(button).not.toBeNull();
    });

    it('should render the info icon inside the button', () => {
      const icon = fixture.nativeElement.querySelector('.ri-information-2-line');
      expect(icon).not.toBeNull();
    });
  });

  describe('inputs', () => {
    it('should accept a title input', () => {
      componentRef.setInput('title', 'Test Title');
      fixture.detectChanges();
      expect(component.title()).toBe('Test Title');
    });

    it('should accept a helpInfo input', () => {
      componentRef.setInput('helpInfo', '<p>Help information</p>');
      fixture.detectChanges();
      expect(component.helpInfo()).toBe('<p>Help information</p>');
    });

    it('should accept a documentationLink input', () => {
      componentRef.setInput('documentationLink', 'https://docs.example.com');
      fixture.detectChanges();
      expect(component.documentationLink()).toBe('https://docs.example.com');
    });
  });

  describe('show()', () => {
    it('should cancel any pending hide and show the popover', () => {
      const mockPopover = {show: jest.fn(), hide: jest.fn()};
      Object.defineProperty(component, 'popover', {value: () => mockPopover, writable: true});
      const cancelHideSpy = jest.spyOn(component, 'cancelHide');

      const event = new MouseEvent('mouseover');
      component.show(event);

      expect(cancelHideSpy).toHaveBeenCalled();
      expect(mockPopover.show).toHaveBeenCalledWith(event);
    });

    it('should be triggered by mouseover on the button', () => {
      const showSpy = jest.spyOn(component, 'show');
      const pButton: HTMLElement = fixture.nativeElement.querySelector('p-button');
      pButton.dispatchEvent(new MouseEvent('mouseover'));
      expect(showSpy).toHaveBeenCalled();
    });

    it('should be triggered by focus on the button', () => {
      const showSpy = jest.spyOn(component, 'show');
      const pButton: HTMLElement = fixture.nativeElement.querySelector('p-button');
      pButton.dispatchEvent(new FocusEvent('focus'));
      expect(showSpy).toHaveBeenCalled();
    });
  });

  describe('hide()', () => {
    it('should hide the popover after the delay', () => {
      jest.useFakeTimers();
      const mockPopover = {show: jest.fn(), hide: jest.fn()};
      Object.defineProperty(component, 'popover', {value: () => mockPopover, writable: true});

      component.hide();

      expect(mockPopover.hide).not.toHaveBeenCalled();
      jest.advanceTimersByTime(180);
      expect(mockPopover.hide).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should be triggered by mouseleave on the button', () => {
      const hideSpy = jest.spyOn(component, 'hide');
      const pButton: HTMLElement = fixture.nativeElement.querySelector('p-button');
      pButton.dispatchEvent(new MouseEvent('mouseleave'));
      expect(hideSpy).toHaveBeenCalled();
    });

    it('should be triggered by focusout on the button', () => {
      const hideSpy = jest.spyOn(component, 'hide');
      const pButton: HTMLElement = fixture.nativeElement.querySelector('p-button');
      pButton.dispatchEvent(new FocusEvent('focusout'));
      expect(hideSpy).toHaveBeenCalled();
    });
  });

  describe('cancelHide()', () => {
    it('should prevent the popover from hiding when called before the delay elapses', () => {
      jest.useFakeTimers();
      const mockPopover = {show: jest.fn(), hide: jest.fn()};
      Object.defineProperty(component, 'popover', {value: () => mockPopover, writable: true});

      component.hide();
      component.cancelHide();
      jest.advanceTimersByTime(180);

      expect(mockPopover.hide).not.toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should do nothing when no hide is pending', () => {
      expect(() => component.cancelHide()).not.toThrow();
    });
  });

  describe('ngOnDestroy()', () => {
    it('should cancel any pending hide timeout', () => {
      jest.useFakeTimers();
      const mockPopover = {show: jest.fn(), hide: jest.fn()};
      Object.defineProperty(component, 'popover', {value: () => mockPopover, writable: true});

      component.hide();
      component.ngOnDestroy();
      jest.advanceTimersByTime(180);

      expect(mockPopover.hide).not.toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should not throw when called without a pending hide', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
