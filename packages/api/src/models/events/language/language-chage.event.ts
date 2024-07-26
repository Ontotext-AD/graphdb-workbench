import {EventType, Event} from '../event';

export class LanguageChangeEvent extends Event {
    constructor(locale: string) {
        super(EventType.LANGUAGE_CHANGED, {locale});
    }
}
