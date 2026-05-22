import {TestBed} from '@angular/core/testing';
import {ConfirmationService} from 'primeng/api';
import {TranslocoService} from '@jsverse/transloco';
import {ConfirmationProviderService} from './confirmation-provider.service';
import {ConfirmationConfig} from './model/confirmation-config';

describe('ConfirmationProviderService', () => {
  let service: ConfirmationProviderService;
  let mockConfirm: jest.Mock;
  let mockTranslate: jest.Mock;

  const DEFAULT_CONFIRM_LABEL = 'Confirm';
  const DEFAULT_CANCEL_LABEL = 'Cancel';

  beforeEach(() => {
    mockConfirm = jest.fn();
    mockTranslate = jest.fn((key: string) => {
      const translations: Record<string, string> = {
        'components.dialog.confirmation.confirm_btn': DEFAULT_CONFIRM_LABEL,
        'components.dialog.confirmation.cancel_btn': DEFAULT_CANCEL_LABEL,
      };
      return translations[key] ?? key;
    });

    TestBed.configureTestingModule({
      providers: [
        ConfirmationProviderService,
        {provide: ConfirmationService, useValue: {confirm: mockConfirm}},
        {provide: TranslocoService, useValue: {translate: mockTranslate}},
      ]
    });

    service = TestBed.inject(ConfirmationProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#confirm', () => {
    const buildMinimalConfig = (overrides: Partial<ConfirmationConfig> = {}): ConfirmationConfig => ({
      message: 'Are you sure?',
      header: 'Confirm action',
      acceptHandler: jest.fn(),
      ...overrides,
    });

    it('should call ConfirmationService.confirm once', () => {
      service.confirm(buildMinimalConfig());

      expect(mockConfirm).toHaveBeenCalledTimes(1);
    });

    it('should pass message and header to the underlying service', () => {
      service.confirm(buildMinimalConfig({message: 'Delete item?', header: 'Delete'}));

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({message: 'Delete item?', header: 'Delete'})
      );
    });

    it('should pass target to the underlying service when provided', () => {
      const target = document.createElement('button');
      service.confirm(buildMinimalConfig({target}));

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({target})
      );
    });

    it('should pass target as undefined when not provided', () => {
      service.confirm(buildMinimalConfig());

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({target: undefined})
      );
    });

    describe('acceptButtonProps', () => {
      it('should use the translated default label when acceptButton is not provided', () => {
        service.confirm(buildMinimalConfig());

        expect(mockConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            acceptButtonProps: expect.objectContaining({label: DEFAULT_CONFIRM_LABEL})
          })
        );
      });

      it('should use the custom label when acceptButton.label is provided', () => {
        service.confirm(buildMinimalConfig({acceptButton: {label: 'Yes, delete', type: 'danger'}}));

        expect(mockConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            acceptButtonProps: expect.objectContaining({label: 'Yes, delete'})
          })
        );
      });

      it('should default severity to "primary" when acceptButton type is not provided', () => {
        service.confirm(buildMinimalConfig());

        expect(mockConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            acceptButtonProps: expect.objectContaining({severity: 'primary'})
          })
        );
      });

      it('should use the custom severity when acceptButton.type is provided', () => {
        service.confirm(buildMinimalConfig({acceptButton: {label: 'Yes', type: 'danger'}}));

        expect(mockConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            acceptButtonProps: expect.objectContaining({severity: 'danger'})
          })
        );
      });
    });

    describe('rejectButtonProps', () => {
      it('should use the translated default label when rejectButton is not provided', () => {
        service.confirm(buildMinimalConfig());

        expect(mockConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            rejectButtonProps: expect.objectContaining({label: DEFAULT_CANCEL_LABEL})
          })
        );
      });

      it('should use the custom label when rejectButton.label is provided', () => {
        service.confirm(buildMinimalConfig({rejectButton: {label: 'No, keep it', type: 'secondary'}}));

        expect(mockConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            rejectButtonProps: expect.objectContaining({label: 'No, keep it'})
          })
        );
      });

      it('should default severity to "secondary" when rejectButton type is not provided', () => {
        service.confirm(buildMinimalConfig());

        expect(mockConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            rejectButtonProps: expect.objectContaining({severity: 'secondary'})
          })
        );
      });

      it('should use the custom severity when rejectButton.type is provided', () => {
        service.confirm(buildMinimalConfig({rejectButton: {label: 'No', type: 'contrast'}}));

        expect(mockConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            rejectButtonProps: expect.objectContaining({severity: 'contrast'})
          })
        );
      });
    });

    describe('button style classes', () => {
      describe('acceptButtonStyleClass', () => {
        it('should default to "confirm-btn" when acceptButton styleClass is not provided', () => {
          service.confirm(buildMinimalConfig());

          expect(mockConfirm).toHaveBeenCalledWith(
            expect.objectContaining({acceptButtonStyleClass: 'confirm-btn'})
          );
        });

        it('should use the custom styleClass when acceptButton.styleClass is provided', () => {
          service.confirm(buildMinimalConfig({acceptButton: {label: 'Yes', type: 'primary', styleClass: 'my-confirm-btn'}}));

          expect(mockConfirm).toHaveBeenCalledWith(
            expect.objectContaining({acceptButtonStyleClass: 'my-confirm-btn'})
          );
        });
      });

      describe('rejectButtonStyleClass', () => {
        it('should default to "cancel-btn" when rejectButton styleClass is not provided', () => {
          service.confirm(buildMinimalConfig());

          expect(mockConfirm).toHaveBeenCalledWith(
            expect.objectContaining({rejectButtonStyleClass: 'cancel-btn'})
          );
        });

        it('should use the custom styleClass when rejectButton.styleClass is provided', () => {
          service.confirm(buildMinimalConfig({rejectButton: {label: 'No', type: 'secondary', styleClass: 'my-cancel-btn'}}));

          expect(mockConfirm).toHaveBeenCalledWith(
            expect.objectContaining({rejectButtonStyleClass: 'my-cancel-btn'})
          );
        });
      });
    });

    describe('handlers', () => {
      it('should pass the acceptHandler to the underlying service', () => {
        const acceptHandler = jest.fn();
        service.confirm(buildMinimalConfig({acceptHandler}));

        expect(mockConfirm).toHaveBeenCalledWith(
          expect.objectContaining({accept: acceptHandler})
        );
      });

      it('should pass the rejectHandler to the underlying service when provided', () => {
        const rejectHandler = jest.fn();
        service.confirm(buildMinimalConfig({rejectHandler}));

        expect(mockConfirm).toHaveBeenCalledWith(
          expect.objectContaining({reject: rejectHandler})
        );
      });

      it('should pass reject as undefined when rejectHandler is not provided', () => {
        service.confirm(buildMinimalConfig());

        expect(mockConfirm).toHaveBeenCalledWith(
          expect.objectContaining({reject: undefined})
        );
      });
    });
  });
});

