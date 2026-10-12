import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {Rdf4jRepositoryService, ServiceProvider} from '@ontotext/workbench-api';
import {GraphwiseReactodiaFacadeComponent} from './graphwise-reactodia-facade.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {LoggerProvider} from '../../services/logger/logger-provider';
import EN_labels from '../../../assets/i18n/en.json';
import {NotificationProviderService} from '../../services/notification/notification-provider.service';

jest.mock('graphwise-reactodia/loader', () => ({
  defineCustomElements: jest.fn()
}));

describe('GraphwiseReactodiaFacadeComponent', () => {
  const ERROR_LABELS = EN_labels.graph_navigator.errors;
  let component: GraphwiseReactodiaFacadeComponent;
  let fixture: ComponentFixture<GraphwiseReactodiaFacadeComponent>;
  let toastrErrorSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    toastrErrorSpy = jest.spyOn(NotificationProviderService.prototype, 'error').mockImplementation();
    loggerErrorSpy = jest.spyOn(LoggerProvider.logger, 'error').mockImplementation();

    await TestBed.configureTestingModule({
      imports: [
        GraphwiseReactodiaFacadeComponent,
        provideTranslocoForTesting()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GraphwiseReactodiaFacadeComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentRepository', 'test-repo');
    fixture.componentRef.setInput('language', 'en');
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const getReactodiaElement = (): HTMLElement => fixture.nativeElement.querySelector('graphwise-reactodia');

  const dispatchReactodiaError = (code: string, error: Error): void => {
    getReactodiaElement().dispatchEvent(new CustomEvent('graphwiseReactodiaError', {detail: {code, error}}));
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('graphwise-reactodia errors', () => {
    it.each([
      ['missing-required-prop', ERROR_LABELS['missing-required-prop']],
      ['data-fetch', ERROR_LABELS['data-fetch']],
      ['diagram-load', ERROR_LABELS['diagram-load']],
      ['diagram-import', ERROR_LABELS['diagram-import']],
      ['local-diagram-read', ERROR_LABELS['local-diagram-read']],
      ['local-diagram-save', ERROR_LABELS['local-diagram-save']]
    ])('should show the matching toast and log the error, when a "%s" error is reported', (code, message) => {
      const error = new Error('Something failed');

      dispatchReactodiaError(code, error);

      expect(toastrErrorSpy).toHaveBeenCalledTimes(1);
      expect(toastrErrorSpy).toHaveBeenCalledWith(message);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(message, error);
    });

    it('should show the default toast and log the error, when its code is unknown', () => {
      const error = new Error('Something failed');

      dispatchReactodiaError('unknown-code', error);

      expect(toastrErrorSpy).toHaveBeenCalledTimes(1);
      expect(toastrErrorSpy).toHaveBeenCalledWith(ERROR_LABELS.default);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(ERROR_LABELS.default, error);
    });

    it('should not show a toast or log by itself, when the query function fails', async () => {
      const error = new Error('Query failed');
      jest.spyOn(ServiceProvider.get(Rdf4jRepositoryService), 'executeSparqlRequest').mockRejectedValue(error);
      const {queryFunction} = (getReactodiaElement() as unknown as {config: {queryFunction: (params: unknown) => Promise<unknown>}}).config;

      const request = queryFunction({url: 'test-repo', body: 'SELECT * {}', headers: {}, method: 'POST'});

      // The failure is passed on to graphwise-reactodia, which reports it back as a "data-fetch" error
      await expect(request).rejects.toBe(error);
      expect(toastrErrorSpy).not.toHaveBeenCalled();
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });
  });
});
