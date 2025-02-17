const app = document.getElementById('onto-layout');

const setDefaultRestrictedPages = () => {
    renderPage();
    testContext.updateRestrictedPage({
      '/pages/restricted-pages/restricted-page': true});
}

const makeCurrentPageRestricted = () => {
    renderPage();
    testContext.updateRestrictedPage({
            '/pages/restricted-pages': true,
            '/pages/restricted-pages/restricted-page': true
        }
    );
};

const makeCurrentPageUnrestricted = () => {
    renderPage();
    testContext.updateRestrictedPage({
        '/pages/restricted-pages': false,
        '/pages/restricted-pages/restricted-page': true});
};

const makeRestrictedPagesMapUndefined = () => {
    renderPage();
    testContext.updateRestrictedPage(undefined);
};

const makeRestrictedPagesMapEmpty = () => {
    renderPage();
    testContext.updateRestrictedPage({});
};

const createFragment = (content) => {
    const fragment = document.createDocumentFragment();
    const main = document.createElement('main');
    main.id = 'app';
    main.setAttribute('slot', 'main');
    main.innerHTML = content;
    fragment.appendChild(main);
    return fragment;
};

const routes = {
    '/pages/restricted-pages': () => createFragment('<h1>Welcome to the Home Page</h1>'),
    '/pages/restricted-pages/restricted-page': () => createFragment('<h1>Restricted page</h1><p>This is a restricted page and should not be visible.</p>'),
    '/pages/restricted-pages/unrestricted-page': () => createFragment('<h1>Unrestricted page</h1><p>This is a unrestricted page and should be visible.</p>')
};

// Function to handle navigation
function navigateTo(url) {
    setDefaultRestrictedPages();
    // Update the URL without reloading
    const oldUrl = window.location.pathname;
    history.pushState(null, null, url);
    const newUrl = window.location.pathname;
    testContext.emitNavigateEndEvent(oldUrl, newUrl);
    renderPage();
}

// Function to render the content based on the current route
// Only the content of the `<main>` element is manipulated to save DOM manipulation and re-rendering
function renderPage() {
    const currentRoute = window.location.pathname;
    if (app && routes[currentRoute]) {
        let mainElement = app.querySelector('main[slot="main"]');
        if (!mainElement) {
            mainElement = document.createElement('main');
            mainElement.setAttribute('slot', 'main');
            app.appendChild(mainElement);
        }

        // Update the content of the existing main element
        const newContent = routes[currentRoute]();
        mainElement.innerHTML = '';
        while (newContent.firstChild) {
            mainElement.appendChild(newContent.firstChild);
        }
    }
}

// Menu items are not needed in these scenarios
window.PluginRegistry = {
    get: () => []
};

// Initial render
setDefaultRestrictedPages();

renderPage();
