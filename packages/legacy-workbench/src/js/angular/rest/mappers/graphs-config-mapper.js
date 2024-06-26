import {GraphsConfig} from "../../models/graphs/graphs-config";

export const mapGraphsConfigResponseToModel = (responseData) => {
    return new GraphsConfig(
        responseData.id,
        responseData.name,
        responseData.startMode,
        responseData.owner,
        responseData.startQueryIncludeInferred,
        responseData.startQuerySameAs,
        responseData.startGraphQuery,
        responseData.startIRI,
        responseData.startIRILabel,
        responseData.expandQuery,
        responseData.resourceQuery,
        responseData.predicateLabelQuery,
        responseData.resourcePropertiesQuery,
        responseData.shared,
        responseData.description,
        responseData.hint
    );
};

export const mapGraphConfigSampleToGraphConfig = (responseData) => {
    return new GraphsConfig(
        responseData.id,
        responseData.name,
        responseData.startMode,
        responseData.owner,
        responseData.startQueryIncludeInferred,
        responseData.startQuerySameAs,
        responseData.startGraphQuery,
        responseData.startIRI,
        responseData.startIRILabel,
        responseData.expandQuery,
        responseData.resourceQuery,
        responseData.predicateLabelQuery,
        responseData.resourcePropertiesQuery,
        responseData.shared,
        responseData.description,
        responseData.hint,
        responseData.startGraphQueryDescription,
        responseData.expandQueryDescription,
        responseData.resourceQueryDescription,
        responseData.predicateLabelQueryDescription,
        responseData.resourcePropertiesQueryDescription
    );
};

export const mapGraphConfigSamplesToGraphConfigs = (responseData) => {
    return responseData.map((sampleResponse) => mapGraphConfigSampleToGraphConfig(sampleResponse));
};
