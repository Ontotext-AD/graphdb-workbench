let loadingHintCounter = 0;
let loadingHintInterval = setInterval(function() {
    loadingHintCounter++;
    if (loadingHintCounter === 5) {
        $('.ot-splash div').text("GraphDB Workbench is still loading but it's taking longer than usual, please wait...");
    }

    if (loadingHintCounter === 10) {
        $('.ot-splash div').text("If the Workbench hasn't loaded yet, please try to clear your browser cache and reload the page.");
    }

    if (loadingHintCounter >= 10 || $('.ot-splash').css('display') !== 'block') {
        clearInterval(loadingHintInterval);
        loadingHintInterval = undefined;
        loadingHintCounter = undefined;
    }
}, 2000);
