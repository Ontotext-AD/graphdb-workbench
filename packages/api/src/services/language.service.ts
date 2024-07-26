import {EventService} from './event.service';
import {ServiceProvider} from '../service.provider';
import {LanguageChangeEvent} from '../models/events/language/language-chage.event';
import {Service} from './service';
import {GlobalContextService} from './global-context.service';
import {Subject} from '@reactivex/rxjs/dist/package';

export class LanguageService implements Service {
    private readonly eventService: EventService;
    private readonly globalContextService: GlobalContextService;

    static readonly DEFAULT_LANGUAGE = 'en';

    constructor() {
        this.eventService = ServiceProvider.get(EventService);
        this.globalContextService = ServiceProvider.get(GlobalContextService);
    }

    changeLanguage(locale: string): void {
        this.eventService.emit(new LanguageChangeEvent(locale));
    }

    onLanguageChanged(): Subject<string> {
        return this.globalContextService.onLanguageChanged();
    }
}
