export const toYasguiOutputModel = ($event) => {
    switch ($event.detail.TYPE) {
        case "downloadAs":
            return buildDownloadAsModel($event);
        default:
            return $event.detail;
    }
};

export const buildDownloadAsModel = ($event) => {
    return {
        TYPE: $event.detail.TYPE,
        contentType: $event.detail.payload.value,
        pluginName: $event.detail.payload.pluginName,
        query: $event.detail.payload.query,
        infer: $event.detail.payload.infer,
        sameAs: $event.detail.payload.sameAs
    };
};

export const downloadAsFile = (filename, contentType, content) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${contentType};charset=utf-8, + ${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
