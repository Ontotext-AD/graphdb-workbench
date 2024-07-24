import {WorkbenchEventService} from './workbench-event.service';
import {WorkbenchServiceProvider} from '../workbench-service.provider';
import {LanguageChangeEvent} from '../models/events/language/language-chage.event';
import {WorkbenchService} from './workbenchService';
import {WorkbenchGlobalContextService} from './workbench-global-context.service';
import {Subject} from '@reactivex/rxjs/dist/package';

export class WorkbenchLanguageService implements WorkbenchService {
    private readonly eventService: WorkbenchEventService;
    private readonly globalContextService: WorkbenchGlobalContextService;

    static readonly DEFAULT_LANGUAGE = 'en';

    constructor() {
        this.eventService = WorkbenchServiceProvider.get(WorkbenchEventService);
        this.globalContextService = WorkbenchServiceProvider.get(WorkbenchGlobalContextService);
    }

    changeLanguage(locale: string): void {
        this.eventService.emit(new LanguageChangeEvent(locale));
    }

    onLanguageChanged(): Subject<string> {
        return this.globalContextService.onLanguageChanged();
    }
}
