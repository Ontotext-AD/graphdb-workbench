let navbarElement = document.querySelector("onto-navbar");

// Mock the navigateUrl function which is exposed by the single-spa via the root-config module
// in order to allow the menu to work without going anywhere when clicking the menu items
window.singleSpa = {
  navigateToUrl: function (url) {
    console.log('%cnavigate', 'background: blue', url);
  }
};

const selectNavbar = () => document.querySelector("onto-navbar");

function waitForNavbar() {
  return new Promise((resolve) => {
    const navbar = selectNavbar();
    if (navbar) {
      resolve(navbar);
    } else {
      const observer = new MutationObserver(() => {
        const navbar = selectNavbar();
        if (navbar) {
          resolve(navbar);
          observer.disconnect();
        }
      });

      // Observe the entire document body for changes, so we can use this in other scenarios
      // as well. E.g. layout and navbar pages will both work
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  });
}

waitForNavbar().then((navbar) => {
  navbar.menuItems = menuItems
});

