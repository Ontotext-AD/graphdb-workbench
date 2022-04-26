let loadingHintCounter = 0;
let loadingHintInterval = setInterval(function() {
    loadingHintCounter++;
    if (loadingHintCounter === 5) {
        $('.ot-splash div').text($translate.instant('workbench.loading.hint5'));
    }

    if (loadingHintCounter === 10) {
        $('.ot-splash div').text($translate.instant('workbench.loading.hint10'));
    }

    if (loadingHintCounter >= 10 || $('.ot-splash').css('display') !== 'block') {
        clearInterval(loadingHintInterval);
        loadingHintInterval = undefined;
        loadingHintCounter = undefined;
    }
}, 2000);
