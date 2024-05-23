// $translate.instant converts <b> from strings to &lt;b&gt
// and $sce.trustAsHtml could not recognise that this is valid html
export default function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
};
