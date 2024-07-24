import {ReplaySubject, Subject} from '@reactivex/rxjs/dist/package';
import {WorkbenchServiceProvider} from '../workbench-service.provider';
import {WorkbenchEventService} from './workbench-event.service';
import {WorkbenchEventType} from '../models/events/workbench.event';

/**
 * The purpose of this service is to hold the application's global state.
 */
export class WorkbenchGlobalContextService {

    private eventService: WorkbenchEventService;
    private language: ReplaySubject<string> = new ReplaySubject<string>(1);

    constructor() {
        this.language.next("en");
        this.eventService = WorkbenchServiceProvider.get(WorkbenchEventService);
        this.initialize();
    }

    onLanguageChanged(): Subject<string> {
        return this.language;
    }

    private initialize(): void {
        this.eventService.subscribe(WorkbenchEventType.LANGUAGE_CHANGED, (language) => {
            this.language.next(language.locale);
        });
    }
}
