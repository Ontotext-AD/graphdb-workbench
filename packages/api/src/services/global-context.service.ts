import {ReplaySubject, Subject} from '@reactivex/rxjs/dist/package';
import {ServiceProvider} from '../service.provider';
import {EventService} from './event.service';
import {EventType} from '../models/events/event';
import {Service} from './service';

/**
 * The purpose of this service is to hold the application's global state.
 */
export class GlobalContextService implements Service {

    private eventService: EventService;
    private language: ReplaySubject<string> = new ReplaySubject<string>(1);

    constructor() {
        this.language.next("en");
        this.eventService = ServiceProvider.get(EventService);
        this.initialize();
    }

    onLanguageChanged(): Subject<string> {
        return this.language;
    }

    private initialize(): void {
        this.eventService.subscribe(EventType.LANGUAGE_CHANGED, (language) => {
            this.language.next(language.locale);
        });
    }
}
