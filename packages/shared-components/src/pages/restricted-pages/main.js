let bannerElement = document.querySelector("onto-permission-banner");

const setDefaultRestrictedPages = () => testContext.updateRestrictedPage({
    '/pages/restricted-pages/restricted-page': true});

const makeCurrentPageRestricted = () => {
    testContext.updateRestrictedPage({
            '/pages/restricted-pages': true,
            '/pages/restricted-pages/restricted-page': true
        }
    );
};

const makeCurrentPageUnrestricted = () => {
    testContext.updateRestrictedPage({
        '/pages/restricted-pages': false,
        '/pages/restricted-pages/restricted-page': true});
};

const makeRestrictedPagesMapUndefined = () => {
    testContext.updateRestrictedPage(undefined);
};

const makeRestrictedPagesMapEmpty = () => {
    testContext.updateRestrictedPage({});
};

const routes = {
    '/pages/restricted-pages': '<h1>Welcome to the Home Page</h1>',
    '/pages/restricted-pages/restricted-page': '<h1>Restricted page</h1><p>This is a restricted page and should not be visible.</p>',
    '/pages/restricted-pages/unrestricted-page': '<h1>Unrestricted page</h1><p>This is a unrestricted page and should be visible.</p>',
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
function renderPage() {
    const app = document.getElementById('onto-layout');
    const currentRoute = window.location.pathname;
    if (app) {
        app.innerHTML = ` <main id="app" slot="main">${routes[currentRoute]}</main>`;
    }
}

// Handle link clicks
document.body.addEventListener('click', (event) => {
    if (event.target.matches('[data-link]')) {
        // Prevent full-page reload
        event.preventDefault();
        navigateTo(event.target.href);
    }
});

// Initial render
setDefaultRestrictedPages();
renderPage();
