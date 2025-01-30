export class Wizard {
    /**
     * @type {WizardStep[]}
     */
    #steps = [];
    /**
     * The current step of the wizard.
     * @type {number}
     */
    #currentStep = 0;

    /**
     * @param {WizardStep[]} steps The steps of the wizard.
     * @param {number} currentStep The current step of the wizard.
     */
    constructor(steps= [], currentStep = 0) {
        this.#steps = steps;
        this.#currentStep = currentStep;
    }

    /**
     * Adds a step to the wizard.
     * @param {WizardStep} step
     * @returns {Wizard}
     */
    addStep(step) {
        this.#steps.push(step);
        return this;
    }

    getActiveStep() {
        return this.#steps.find((step) => step.active);
    }

    /**
     * Makes a step active.
     * @param {WizardStep} step
     */
    setStepActive(step) {
        this.#steps.forEach((wizardStep) => wizardStep.active = false);
        step.active = true;
    }

    /**
     * Makes the previous step active if there is one.
     * @return {WizardStep}
     */
    previousStep() {
        if (this.#currentStep > 0) {
            this.#currentStep--;
        }
        const previousStep = this.#steps[this.#currentStep];
        this.setStepActive(previousStep);
        return previousStep;
    }

    /**
     * Makes the next step active if there is one.
     * @return {WizardStep}
     */
    nextStep() {
        if (this.#currentStep < this.#steps.length - 1) {
            this.#currentStep++;
        }
        const nextStep = this.#steps[this.#currentStep];
        this.setStepActive(nextStep);
        return nextStep;
    }

    get steps() {
        return this.#steps;
    }

    set steps(value) {
        this.#steps = value;
    }

    get currentStep() {
        return this.#currentStep;
    }

    set currentStep(value) {
        this.#currentStep = value;
    }
}

export class WizardStep {
    /**
     * The id of the step. It must be unique.
     * @type {string}
     */
    #id = '';
    /**
     * The active status of the step.
     * @type {boolean}
     */
    #active = false;
    /**
     * The URL of the template of the step.
     * @type {string}
     */
    #templateUrl = '';
    /**
     * The page url of the step. This will be appended to the route.
     * @type {string}
     */
    #page = '';

    constructor(id, templateUrl, page, active = false) {
        this.#id = id;
        this.#active = active;
        this.#templateUrl = templateUrl;
        this.#page = page;
    }

    get page() {
        return this.#page;
    }

    set page(value) {
        this.#page = value;
    }

    get templateUrl() {
        return this.#templateUrl;
    }

    set templateUrl(value) {
        this.#templateUrl = value;
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = value;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }
}
