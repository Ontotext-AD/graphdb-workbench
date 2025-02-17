export class TabQueryModel {
    constructor(queryName = undefined, query = undefined, owner = undefined, isPublic = true, readonly = true) {
        this.queryName = queryName;
        this.query = query;
        this.owner = owner;
        this.isPublic = isPublic;
        this.readonly = readonly;
    }
}
