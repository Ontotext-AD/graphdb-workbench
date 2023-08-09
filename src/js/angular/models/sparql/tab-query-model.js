export class TabQueryModel {
    constructor(queryName = '', query = '', owner = '', isPublic = true) {
        this.queryName = queryName;
        this.query = query;
        this.owner = owner;
        this.isPublic = isPublic;
    }
}
