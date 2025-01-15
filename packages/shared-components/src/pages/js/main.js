let testContext = document.createElement('onto-test-context');
document.body.appendChild(testContext);
testContext.changeLanguage('en');

// Mock the navigateUrl function which is exposed by the single-spa via the root-config module
// in order to allow the menu to work without going anywhere when clicking the menu items
window.singleSpa = {
  navigateToUrl: function (url) {
    const redirect = document.createElement('div');
    redirect.id = 'redirect-url';
    redirect.innerHTML = `redirect to ${url}`;
    document.body.appendChild(redirect);
  }
};

const updateLicense = (license) => {
  testContext.updateLicense(license);
}

const loadProductInfo = () => {
  testContext.updateProductInfo({
    workbench: '2.8.0',
    sesame: '4.3.15',
    connectors: '16.2.13-RC2',
    productVersion: '11.0-SNAPSHOT'
  });
};

const loadRepositories = () => {
  testContext.loadRepositories();
}
