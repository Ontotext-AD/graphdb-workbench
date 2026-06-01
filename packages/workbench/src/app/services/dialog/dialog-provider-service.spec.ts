import {TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {Subject} from 'rxjs';
import {DialogProviderService} from './dialog-provider.service';
import {DialogOpenOptions} from '../../models/dialog-open-options';

@Component({standalone: true, template: ''})
class TestDialogComponent {}

describe('DialogProviderService', () => {
  let service: DialogProviderService;
  let mockDialogServiceOpen: jest.Mock;
  let onCloseSubject: Subject<unknown>;
  let dialogRef: Partial<DynamicDialogRef>;

  beforeEach(() => {
    onCloseSubject = new Subject<unknown>();
    dialogRef = {onClose: onCloseSubject.asObservable()};
    mockDialogServiceOpen = jest.fn().mockReturnValue(dialogRef);

    TestBed.configureTestingModule({
      providers: [
        DialogProviderService,
        {provide: DialogService, useValue: {open: mockDialogServiceOpen}}
      ]
    });
    service = TestBed.inject(DialogProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#open', () => {
    it('should call DialogService.open with the correct component type', () => {
      const config: DialogOpenOptions<unknown> = {};

      void service.open(TestDialogComponent, config);

      expect(mockDialogServiceOpen).toHaveBeenCalledWith(TestDialogComponent, expect.any(Object));
    });

    it('should pass data from config to the dialog', () => {
      const data = {foo: 'bar'};
      const config: DialogOpenOptions<typeof data> = {data};

      void service.open(TestDialogComponent, config);

      const usedConfig: DynamicDialogConfig = mockDialogServiceOpen.mock.calls[0][1];
      expect(usedConfig.data).toEqual(data);
    });

    it('should set showHeader to true when header is provided', () => {
      const config: DialogOpenOptions<unknown> = {header: 'My Dialog'};

      void service.open(TestDialogComponent, config);

      const usedConfig: DynamicDialogConfig = mockDialogServiceOpen.mock.calls[0][1];
      expect(usedConfig.showHeader).toBe(true);
      expect(usedConfig.header).toBe('My Dialog');
    });

    it('should set showHeader to false when header is not provided', () => {
      const config: DialogOpenOptions<unknown> = {};

      void service.open(TestDialogComponent, config);

      const usedConfig: DynamicDialogConfig = mockDialogServiceOpen.mock.calls[0][1];
      expect(usedConfig.showHeader).toBe(false);
    });

    it('should forward width and height from config', () => {
      const config: DialogOpenOptions<unknown> = {width: '600px', height: '400px'};

      void service.open(TestDialogComponent, config);

      const usedConfig: DynamicDialogConfig = mockDialogServiceOpen.mock.calls[0][1];
      expect(usedConfig.width).toBe('600px');
      expect(usedConfig.height).toBe('400px');
    });

    it('should default closable to false when not provided', () => {
      const config: DialogOpenOptions<unknown> = {};

      void service.open(TestDialogComponent, config);

      const usedConfig: DynamicDialogConfig = mockDialogServiceOpen.mock.calls[0][1];
      expect(usedConfig.closable).toBe(false);
    });

    it('should use the provided closable value', () => {
      const config: DialogOpenOptions<unknown> = {closable: true};

      void service.open(TestDialogComponent, config);

      const usedConfig: DynamicDialogConfig = mockDialogServiceOpen.mock.calls[0][1];
      expect(usedConfig.closable).toBe(true);
    });

    it('should default modal to true when not provided', () => {
      const config: DialogOpenOptions<unknown> = {};

      void service.open(TestDialogComponent, config);

      const usedConfig: DynamicDialogConfig = mockDialogServiceOpen.mock.calls[0][1];
      expect(usedConfig.modal).toBe(true);
    });

    it('should use the provided modal value', () => {
      const config: DialogOpenOptions<unknown> = {modal: false};

      void service.open(TestDialogComponent, config);

      const usedConfig: DynamicDialogConfig = mockDialogServiceOpen.mock.calls[0][1];
      expect(usedConfig.modal).toBe(false);
    });

    it('should always apply the onto-dialog styleClass', () => {
      void service.open(TestDialogComponent, {});

      const usedConfig: DynamicDialogConfig = mockDialogServiceOpen.mock.calls[0][1];
      expect(usedConfig.styleClass).toContain('onto-dialog');
    });

    it('should always set draggable to false', () => {
      void service.open(TestDialogComponent, {});

      const usedConfig: DynamicDialogConfig = mockDialogServiceOpen.mock.calls[0][1];
      expect(usedConfig.draggable).toBe(false);
    });

    it('should return a Promise that resolves with the value passed when the dialog closes', async () => {
      const returnValue = {result: 'success'};
      const resultPromise = service.open<unknown, typeof returnValue>(TestDialogComponent, {});

      onCloseSubject.next(returnValue);

      await expect(resultPromise).resolves.toEqual(returnValue);
    });

    it('should return a Promise that resolves undefined when the dialog closes without a value', async () => {
      const resultPromise = service.open(TestDialogComponent, {});

      onCloseSubject.next(undefined);

      await expect(resultPromise).resolves.toBeUndefined();
    });

    it('should throw an error when the dialog fails to open (null ref)', () => {
      mockDialogServiceOpen.mockReturnValue(null);

      expect(() => service.open(TestDialogComponent, {})).toThrow('Dialog failed to open');
    });

    it('should throw an error when the dialog fails to open (undefined ref)', () => {
      mockDialogServiceOpen.mockReturnValue(undefined);

      expect(() => service.open(TestDialogComponent, {})).toThrow('Dialog failed to open');
    });
  });

});
