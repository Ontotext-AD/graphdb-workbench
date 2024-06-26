import {ResourceDetails} from "./resource-details";
import {ContextTypes} from "./context-type";

export class ResourceInfo {
    constructor() {
        this.role = 'subject';
        this.uri = undefined;
        this.triple = undefined;
        this.context = undefined;
        this.contextType = ContextTypes.EXPLICIT;
        this.sameAs = true;
        this.details = new ResourceDetails();
        this.blanks = true;
    }
}
