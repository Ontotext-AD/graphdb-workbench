import {WorkbenchEventType, WorkbenchEvent} from '../workbench.event';

export class LanguageChangeEvent extends WorkbenchEvent {
    constructor(locale: string) {
        super(WorkbenchEventType.LANGUAGE_CHANGED, {locale});
    }
}
