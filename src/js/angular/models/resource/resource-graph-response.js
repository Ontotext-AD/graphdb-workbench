export class ResourceGraphResponse {
    /**
     * Initializes a resource response.
     * @param {ResourceGraphResponseHead} head
     * @param {ResourceGraphResponseResults} results
     */
    constructor(head = new ResourceGraphResponseHead(), results = new ResourceGraphResponseResults()) {}
}

export class ResourceGraphResponseHead {
    /**
     * Initializes a resource response head.
     * @param {{vars: string[]}} head
     */
    constructor(head = {vars: []}) {}
}

export class ResourceGraphResponseResults {
    /**
     * Initializes a resource response results.
     * @param {{bindings: ResourceGraphResponseBinding[]}} results
     */
    constructor(results = {bindings: []}) {}
}

export class ResourceGraphResponseBinding {
    /**
     * Initializes a resource binding.
     * @param {ResourceGraphResponseBindingSubject} subject
     * @param {ResourceGraphResponseBindingPredicate} predicate
     * @param {ResourceGraphResponseBindingObject} object
     * @param {ResourceGraphResponseBindingContext} context
     */
    constructor(subject, predicate, object, context) {
    }
}

export class ResourceGraphResponseBindingContext {
    constructor(type = undefined, value = undefined) {}
}

export class ResourceGraphResponseBindingObject {
    constructor(type = undefined, value = undefined) {}
}

export class ResourceGraphResponseBindingPredicate {
    constructor(type = undefined, value = undefined) {}
}

export class ResourceGraphResponseBindingSubject {
    constructor(type = undefined, value = undefined) {}
}
