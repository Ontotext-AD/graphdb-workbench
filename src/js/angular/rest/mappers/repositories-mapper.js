import {
    RepositoryConfigModel,
    RepositoryInfoModel,
    RepositoryParam,
    RepositoryParams
} from "../../models/repository/repository";

export const repositoryConfigMapper = (data) => {
    return new RepositoryConfigModel({
        id: data.id,
        title: data.title,
        type: data.type,
        sesameType: data.sesameType,
        location: data.location,
        params: repositoryParamsMapper(data.params)
    });
};

function repositoryParamsMapper(paramsResponse) {
    const paramsModel = new RepositoryParams();
    Object.keys(paramsResponse).forEach((key) => {
        paramsModel.addParam(new RepositoryParam(paramsResponse[key]));
    });
    return paramsModel;
}

export const repositoryInfoMapper = (data) => {
    if (!data) {
        return null;
    }
    return new RepositoryInfoModel({
        id: data.id,
        title: data.title,
        type: data.type,
        sesameType: data.sesameType,
        uri: data.uri,
        externalUrl: data.externalUrl,
        location: data.location,
        state: data.state,
        local: data.local,
        readable: data.readable,
        writable: data.writable,
        unsupported: data.unsupported
    });
}
