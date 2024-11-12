export class CheckboxControlModel {
    constructor(resourceList) {
        this.resources = resourceList;
    }

    areMixedSelections() {
        return this.resources.some((resource) => resource.selected) && this.resources.some((resource) => !resource.selected);
    }

    areNoneSelected() {
        return this.resources.every((resource) => !resource.selected);
    }

    areAllSelected() {
        return this.resources.every((resource) => resource.selected);
    }

    getResourcesList() {
        return this.resources;
    }
}
