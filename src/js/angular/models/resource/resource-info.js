import {ResourceDetails} from "./resource-details";

export class ResourceInfo {
    constructor() {
        this.role = undefined;
        this.uri = undefined;
        this.triple = undefined;
        this.context = undefined;
        this.inference = true;
        this.sameAs = true;
        this.details = new ResourceDetails();
        this.blanks = true;
    }
}
