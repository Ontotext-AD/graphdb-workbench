import {SimilarityIndex} from "./similarity-index";
import {SimilarityQueryType} from "./similarity-query-type";
import {RenderingMode} from "../ontotext-yasgui/rendering-mode";

const filenamePattern = new RegExp('^[a-zA-Z0-9-_]+$');

export class SimilarityIndexInfo {
    constructor() {
        this.similarityIndex = new SimilarityIndex();
        this.isNameExist = false;
        this.invalidSelectQueryType = false;
        this.invalidSelectQuery = false;
        this.invalidSearchQueryType = false;
        this.invalidSearchQuery = false;
        this.invalidAnalogicalQueryType = false;
        this.invalidAnalogicalQuery = false;
        /**
         * Holds the type of the selected query to be displayed, which determines the active tab.
         *
         * @type {string} - any of {@SimilarityQueryType} values.
         */
        this.selectedQueryType = SimilarityQueryType.DATA;
        this.selectedYasguiRenderMode = RenderingMode.YASQE;
    }

    /**
     * Sets the <code>query</code> as query of type <code>similarityQueryType</code>. If <code>similarityQueryType</code> not passed then the
     * currently selected type will be used. {@see SimilarityIndexInfo#selectedQueryType}.
     *
     * @param {string} query - the query to be set.
     * @param {string | undefined} similarityQueryType - the new value of similarity index type. The value have to be one of {@link SimilarityQueryType}.
     */
    setQuery(query, similarityQueryType = undefined) {
        const queryType = similarityQueryType || this.selectedQueryType;
        if (SimilarityQueryType.DATA === queryType) {
            this.similarityIndex.selectQuery = query;
            return;
        }

        if (SimilarityQueryType.SEARCH === queryType) {
            this.similarityIndex.searchQuery = query;
            return;
        }

        if (SimilarityQueryType.ANALOGICAL === queryType) {
            this.similarityIndex.analogicalQuery = query;
        }
    }

    /**
     * Fetches the query depends on <code>similarityQueryType</code>. If <code>similarityQueryType</code> not passed then the
     * currently selected type will be used. {@see SimilarityIndexInfo#selectedQueryType}.
     *
     * @param {string | undefined} similarityQueryType - the type of query that have to be returned. The value have to be one of {@link SimilarityQueryType}.
     * @return {string} the requested query.
     */
    getQuery(similarityQueryType = undefined) {
        const queryType = similarityQueryType || this.selectedQueryType;
        switch (queryType) {
            case SimilarityQueryType.DATA:
                return this.similarityIndex.selectQuery;
            case SimilarityQueryType.SEARCH:
                return this.similarityIndex.searchQuery;
            case SimilarityQueryType.ANALOGICAL:
                return this.similarityIndex.analogicalQuery;
        }
    }

    /**
     * Marks a SPARQL query as valid/invalid depends on the <code>isValid</code> value. If <code>similarityQueryType</code> is not passed,
     * then the currently selected type will be used.
     *
     * @param {string} similarityQueryType - the type of SPARQL query, that have to be marked as valid/invalid. The value must be one of {@see SimilarityQueryType} values.
     * @param {boolean} isInvalid - if true the SPARQL query of type <code>similarityQueryType</code> will be marked as invalid, If false will be marked as valid.
     */
    markInvalidQuery(similarityQueryType = undefined, isInvalid = true) {
        const queryType = similarityQueryType || this.selectedQueryType;
        if (SimilarityQueryType.DATA === queryType) {
            this.invalidSelectQuery = isInvalid;
            return;
        }

        if (SimilarityQueryType.SEARCH === queryType) {
            this.invalidSearchQuery = isInvalid;
            return;
        }
        if (SimilarityQueryType.ANALOGICAL === queryType) {
            this.invalidAnalogicalQuery = isInvalid;
        }
    }

    /**
     * Marks a SPARQL query type as valid/invalid depends on the <code>isValid</code> value. If <code>similarityQueryType</code> is not passed,
     * then the currently selected type will be used.
     *
     * @param {string} similarityQueryType - the type of similarity query, that have to be marked as valid/invalid query type. The value must be one of {@see SimilarityQueryType} values.
     * @param {boolean} isInvalid - if true the SPARQL query of type <code>similarityQueryType</code> will be marked as invalid SPARQL query type, If false will be marked as valid.
     */
    markInvalidQueryType(similarityQueryType = undefined, isInvalid = true) {
        const queryType = similarityQueryType || this.selectedQueryType;
        if (SimilarityQueryType.DATA === queryType) {
            this.invalidSelectQueryType = isInvalid;
            return;
        }

        if (SimilarityQueryType.SEARCH === queryType) {
            this.invalidSearchQueryType = isInvalid;
            return;
        }
        if (SimilarityQueryType.ANALOGICAL === queryType) {
            this.invalidAnalogicalQueryType = isInvalid;
        }
    }

    setSelectedQueryType(queryType) {
        this.selectedQueryType = queryType;
    }

    getSelectedQueryType() {
        return this.selectedQueryType;
    }

    setSelectedYasguiRenderMode(renderMode) {
        this.selectedYasguiRenderMode = renderMode;
    }

    getSelectedYasguiRenderMode() {
        return this.selectedYasguiRenderMode;
    }

    isDataQueryTypeSelected() {
        return SimilarityQueryType.DATA === this.selectedQueryType;
    }

    isSearchQueryTypeSelected() {
        return SimilarityQueryType.SEARCH === this.selectedQueryType;
    }

    isAnalogicalQueryTypeSelected() {
        return SimilarityQueryType.ANALOGICAL === this.selectedQueryType;
    }

    isTextType() {
        return this.similarityIndex.isTextType();
    }

    isPredicationType() {
        return this.similarityIndex.isPredicationType();
    }

    isTextLiteralType() {
        return this.similarityIndex.isTextLiteralType();
    }

    hasName() {
        return !!this.similarityIndex.name;
    }

    isNameValid() {
        return filenamePattern.test(this.similarityIndex.name);
    }

    hasSelectQuery() {
        return !!this.similarityIndex.selectQuery;
    }

    hasSearchQuery() {
        return !!this.similarityIndex.searchQuery;
    }

    hasAnalogicalQuery() {
        return !!this.similarityIndex.analogicalQuery;
    }

    isYasqeRenderMode() {
        return RenderingMode.YASQE === this.getSelectedYasguiRenderMode();
    }

    isYasrRenderMode() {
        return RenderingMode.YASR === this.getSelectedYasguiRenderMode();
    }

    ///////////////////////////////////////
    // Similarity index getters and setters
    ///////////////////////////////////////

    getName() {
        return this.similarityIndex.name;
    }

    setName(name) {
        this.similarityIndex.name = name;
    }

    setInputIndex(inputIndex) {
        this.similarityIndex.inputIndex = inputIndex;
    }

    getInputIndex() {
        return this.similarityIndex.inputIndex;
    }

    setLiteralIndex(literalIndex = false) {
        this.similarityIndex.isLiteralIndex = literalIndex;
    }

    getSimilarityIndex() {
        return this.similarityIndex;
    }

    setStopList(stopList) {
        this.similarityIndex.stopList = stopList;
    }

    getStopList() {
        return this.similarityIndex.stopList;
    }

    setAnalyzer(analyzer = 'org.apache.lucene.analysis.en.EnglishAnalyzer') {
        this.similarityIndex.analyzer = analyzer;
    }

    getAnalyzer() {
        return this.similarityIndex.analyzer;
    }

    setType(type) {
        this.similarityIndex.type = type;
    }

    getType() {
        return this.similarityIndex.type;
    }

    setOptions(options) {
        this.similarityIndex.options = options;
    }

    getOptions() {
        return this.similarityIndex.options;
    }

    getInference() {
        return this.similarityIndex.infer;
    }

    getSameAs() {
        return this.similarityIndex.sameAs;
    }
}
